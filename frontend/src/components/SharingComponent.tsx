import {RedditShareButton, RedditIcon, XShareButton, XIcon} from 'react-share';
import "./SharingComponent.css";

type SharingComponentProps = {
    recipeId?: string;
}

export function SharingComponent({recipeId}: SharingComponentProps){
    if (!recipeId) return null;
    const url = `http://localhost:5173/recipes/${encodeURIComponent(recipeId)}`
    const presetText = `Check out this delicious recipe`
    
    return (
        <div className="share-row">
            <XShareButton url={url} title={presetText} hashtags={['#foodly']}>
                <XIcon size={32} round></XIcon>
            </XShareButton>
            <RedditShareButton url={url} title={presetText}>
                <RedditIcon size={32} round></RedditIcon>
            </RedditShareButton>
        </div>
    )
}