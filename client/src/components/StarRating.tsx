export function StarRating({
  value,
  onChange,
  readOnly = false,
  size = 'text-lg',
}: {
  value: number;
  onChange?: (v: number) => void;
  readOnly?: boolean;
  size?: string;
}) {
  return (
    <div className={`flex gap-0.5 ${size}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readOnly}
          onClick={() => onChange?.(star)}
          className={`${readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-110'} transition ${
            star <= value ? 'text-f1red' : 'text-white/20'
          }`}
          aria-label={`${star} star`}
        >
          ★
        </button>
      ))}
    </div>
  );
}
