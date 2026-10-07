import React from 'react';
import { RenderizacaoVisual } from '../../types/agro';
interface SemanticProductImageProps {
  src: string;
  renderizacao?: RenderizacaoVisual;
  codigo?: string;
}

export const SemanticProductImage: React.FC<SemanticProductImageProps> = ({ src, renderizacao, codigo }) => {
  // Configurações padrão seguras
  const ocupacao = renderizacao?.fator_ocupacao_percentual || 80;
  const ancorarNoChao = renderizacao?.tipo_ancoragem === 'chao';

  return (
    <div 
      className={`relative flex flex-col items-center justify-end w-full ${ancorarNoChao ? 'self-end' : 'self-center'}`}
      style={{ 
        height: `${ocupacao}%`, // Altura limite definida pela IA com base no porte do produto
      }}
    >
      <img
        src={src}
        alt="Produto Recortado"
        className="relative z-10 max-h-full max-w-full object-contain pointer-events-none rounded-2xl"
        style={{
          // Sombra ambiente da silhueta (não é a sombra de piso)
          filter: 'drop-shadow(0px 5px 15px rgba(0,0,0,0.15))' 
        }}
      />
      
      {/* Sombra de Contato Radial (Apenas para produtos pesados/chão) */}
      {ancorarNoChao && (
        <div 
          className="absolute bottom-0 z-0 bg-black/60 rounded-[50%] blur-xl pointer-events-none"
          style={{
            width: '85%', // Sombra um pouco menor que a largura do produto para realismo
            height: '25px', // Altura do achatamento da elipse
            transform: 'translateY(50%)', // Desce metade da altura para ficar embaixo da base da imagem
          }}
        />
      )}
      
      {/* Código do Produto */}
      {codigo && (
        <span className="absolute bottom-[-15px] text-[9px] text-gray-500 font-mono font-bold z-20">
          Cód: {codigo}
        </span>
      )}
    </div>
  );
};
