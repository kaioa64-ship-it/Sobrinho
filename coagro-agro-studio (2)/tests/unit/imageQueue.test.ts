import { describe, it, expect, beforeEach } from 'vitest';
import { ImageQueueManager } from '../../src/lib/imageQueue';

describe('imageQueue — Concurrency Limiter e AbortController Guard', () => {
  let queue: ImageQueueManager;

  beforeEach(() => {
    queue = new ImageQueueManager();
  });

  it('processa tarefas sequencialmente respeitando concorrência máxima de 1', async () => {
    const order: number[] = [];
    let concurrentCount = 0;
    let maxObservedConcurrency = 0;

    const createTask = (id: string, num: number, delayMs: number) => ({
      id,
      run: async () => {
        concurrentCount++;
        maxObservedConcurrency = Math.max(maxObservedConcurrency, concurrentCount);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        order.push(num);
        concurrentCount--;
        return `result_${num}`;
      },
    });

    const p1 = queue.enqueue(createTask('task_1', 1, 30));
    const p2 = queue.enqueue(createTask('task_2', 2, 10));

    expect(queue.isBusy).toBe(true);

    const [r1, r2] = await Promise.all([p1, p2]);

    expect(r1).toBe('result_1');
    expect(r2).toBe('result_2');
    expect(order).toEqual([1, 2]); // Tarefa 1 concluiu antes da Tarefa 2, mesmo sendo mais demorada
    expect(maxObservedConcurrency).toBe(1);
    expect(queue.isBusy).toBe(false);
  });

  it('rejeita imediatamente tarefas com AbortSignal já cancelado', async () => {
    const controller = new AbortController();
    controller.abort();

    await expect(
      queue.enqueue({
        id: 'aborted_task',
        signal: controller.signal,
        run: async () => 'should_not_run',
      })
    ).rejects.toThrow();
  });

  it('cancela tarefas pendentes na fila quando o AbortSignal é disparado antes do início', async () => {
    const executed: string[] = [];

    // Tarefa 1 roda e ocupa a fila
    const p1 = queue.enqueue({
      id: 'task_running',
      run: async () => {
        await new Promise((resolve) => setTimeout(resolve, 50));
        executed.push('task_running');
        return 'done_1';
      },
    });

    // Tarefa 2 aguarda na fila
    const controller2 = new AbortController();
    const p2 = queue.enqueue({
      id: 'task_waiting',
      signal: controller2.signal,
      run: async () => {
        executed.push('task_waiting');
        return 'done_2';
      },
    });

    expect(queue.pendingCount).toBe(1);

    // Cancela a Tarefa 2 enquanto espera
    controller2.abort();

    expect(queue.pendingCount).toBe(0);
    await expect(p2).rejects.toThrow();

    await p1;
    expect(executed).toEqual(['task_running']);
  });

  it('cancela a tarefa em execução ativa via queue.cancel', async () => {
    let wasAborted = false;

    const p = queue.enqueue({
      id: 'long_task',
      run: async (signal) => {
        return new Promise((resolve, reject) => {
          signal.addEventListener('abort', () => {
            wasAborted = true;
            reject(new DOMException('Aborted', 'AbortError'));
          });
        });
      },
    });

    expect(queue.activeTaskId).toBe('long_task');

    queue.cancel('long_task');

    await expect(p).rejects.toThrow();
    expect(wasAborted).toBe(true);
    expect(queue.isBusy).toBe(false);
  });

  it('limpa toda a fila de espera com clearQueue', async () => {
    const p1 = queue.enqueue({
      id: 'job_1',
      run: async () => {
        await new Promise((resolve) => setTimeout(resolve, 40));
        return 'done_1';
      },
    });

    const p2 = queue.enqueue({
      id: 'job_2',
      run: async () => 'done_2',
    });

    const p3 = queue.enqueue({
      id: 'job_3',
      run: async () => 'done_3',
    });

    expect(queue.pendingCount).toBe(2);

    queue.clearQueue();

    expect(queue.pendingCount).toBe(0);

    await expect(p2).rejects.toThrow();
    await expect(p3).rejects.toThrow();

    const r1 = await p1;
    expect(r1).toBe('done_1');
  });
});
