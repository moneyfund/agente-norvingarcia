import { Heart } from 'lucide-react';
import Button from './Button';

function PropertyLikeButton({ likesCount, hasLiked, loading, onToggle, disabled, message }) {
  return (
    <div>
      <Button
        type="button"
        variant={hasLiked ? 'primary' : 'outline'}
        onClick={onToggle}
        disabled={loading || disabled}
        className="inline-flex items-center gap-2"
      >
        <Heart size={16} />
        {loading ? 'Actualizando…' : hasLiked ? 'Te gusta' : 'Me gusta'}{likesCount !== null ? ` (${likesCount})` : ''}
      </Button>
      {message && <p className="ng-meta mt-2" role="status">{message}</p>}
    </div>
  );
}

export default PropertyLikeButton;
