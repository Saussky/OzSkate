interface ButtonProps {
  onClick: () => void;
  disabled: boolean;
  children: React.ReactNode;
}

export default function Button({
  onClick,
  disabled,
  children,
}: ButtonProps): JSX.Element {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="px-6 py-3 text-white font-bold rounded-lg bg-blue-500 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
    >
      {children}
    </button>
  );
}
