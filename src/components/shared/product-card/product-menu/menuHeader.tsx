interface ProductMenuHeaderProps {
  title: string;
  onBack: () => void;
  onClose: () => void;
}

export const ProductMenuHeader: React.FC<ProductMenuHeaderProps> = ({
  title,
  onBack,
  onClose,
}) => (
  <div className="flex items-center justify-between">
    <button aria-label="Back" className="p-1 text-xl" onClick={onBack}>
      ←
    </button>
    <h3 className="text-sm font-semibold">{title}</h3>
    <button aria-label="Close" className="p-1 text-xl" onClick={onClose}>
      ✕
    </button>
  </div>
);
