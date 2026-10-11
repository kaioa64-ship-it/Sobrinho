/**
 * imageQueue.ts — Gerenciador de Fila de Concorrência Controlada para Processamento Neural
 *
 * Garante concorrência máxima de 1 inferência neural simultânea por cliente,
 * mitigando travamento de CPU/GPU e vazamentos de memória em máquinas modestas.
 * Oferece suporte a cancelamento de jobs órfãos (AbortController) e buffer de progresso.
 */

export interface QueuedImageTask<T> {
  id: string;
  run: (signal: AbortSignal) => Promise<T>;
  signal?: AbortSignal;
}

export class ImageQueueManager {
  private queue: Array<{
    task: QueuedImageTask<unknown>;
    resolve: (val: unknown) => void;
    reject: (err: unknown) => void;
  }> = [];

  private isRunning = false;
  private currentAbortController: AbortController | null = null;
  private currentTaskId: string | null = null;

  /**
   * Enfileira uma tarefa neural com controle de concorrência única.
   */
  public enqueue<T>(task: QueuedImageTask<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      // Se a tarefa já chegou abortada
      if (task.signal?.aborted) {
        reject(new DOMException('Aborted', 'AbortError'));
        return;
      }

      this.queue.push({
        task: task as QueuedImageTask<unknown>,
        resolve: resolve as (val: unknown) => void,
        reject: reject as (err: unknown) => void,
      });

      // Se for abortada enquanto aguarda na fila, remove imediatamente
      if (task.signal) {
        task.signal.addEventListener(
          'abort',
          () => {
            this.removeFromQueue(task.id, new DOMException('Aborted', 'AbortError'));
          },
          { once: true }
        );
      }

      this.processNext();
    });
  }

  /**
   * Cancela uma tarefa específica, esteja ela na fila ou em execução ativa.
   */
  public cancel(taskId: string): void {
    if (this.currentTaskId === taskId && this.currentAbortController) {
      this.currentAbortController.abort();
    }
    this.removeFromQueue(taskId, new DOMException('Aborted', 'AbortError'));
  }

  /**
   * Limpa todas as tarefas pendentes na fila.
   */
  public clearQueue(): void {
    while (this.queue.length > 0) {
      const item = this.queue.shift();
      if (item) {
        item.reject(new DOMException('Queue cleared', 'AbortError'));
      }
    }
  }

  public get pendingCount(): number {
    return this.queue.length;
  }

  public get isBusy(): boolean {
    return this.isRunning;
  }

  public get activeTaskId(): string | null {
    return this.currentTaskId;
  }

  private removeFromQueue(taskId: string, reason: Error): void {
    const idx = this.queue.findIndex((item) => item.task.id === taskId);
    if (idx !== -1) {
      const [removed] = this.queue.splice(idx, 1);
      removed.reject(reason);
    }
  }

  private async processNext(): Promise<void> {
    if (this.isRunning || this.queue.length === 0) {
      return;
    }

    const next = this.queue.shift();
    if (!next) return;

    const { task, resolve, reject } = next;

    // Se foi cancelado antes de iniciar a execução
    if (task.signal?.aborted) {
      reject(new DOMException('Aborted', 'AbortError'));
      this.processNext();
      return;
    }

    this.isRunning = true;
    this.currentTaskId = task.id;
    this.currentAbortController = new AbortController();

    // Propaga sinal externo de abort para a tarefa corrente
    const onExternalAbort = () => {
      this.currentAbortController?.abort();
    };
    if (task.signal) {
      task.signal.addEventListener('abort', onExternalAbort, { once: true });
    }

    try {
      const result = await task.run(this.currentAbortController.signal);
      resolve(result);
    } catch (err) {
      reject(err);
    } finally {
      if (task.signal) {
        task.signal.removeEventListener('abort', onExternalAbort);
      }
      this.isRunning = false;
      this.currentTaskId = null;
      this.currentAbortController = null;
      this.processNext();
    }
  }
}

export const globalImageQueue = new ImageQueueManager();
