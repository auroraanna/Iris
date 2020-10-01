
import React from 'react';
import {
  uriType,
  scrollTo,
  sourceIcon,
} from '../util/helpers';
import Link from './Link';
import Icon from './Icon';
import Thumbnail from './Thumbnail';
import LinksSentence from './LinksSentence';
import { I18n } from '../locale';

export default class GridItem extends React.Component {
  componentDidMount() {
    const {
      mopidyActions,
      spotifyActions,
      spotifyAvailable,
      item,
    } = this.props;

    if (!item || item.images) return;

    switch (uriType(item.uri)) {
      case 'artist':
        if (spotifyActions && spotifyAvailable) {
          //spotifyActions.getArtistImages(item);
        }
        break;

      case 'album':
        // If Mopidy doesn't find any images, then it will pass on the call to LastFM
        if (mopidyActions) {
          mopidyActions.getImages([item.uri]);
        }
        break;

      default:
        break;
    }
  }

  shouldComponentUpdate = (nextProps) => {
    const { item } = this.props;
    return nextProps.item !== item;
  }

  onContextMenu = (e) => {
    const { onContextMenu } = this.props;
    if (onContextMenu) {
      onContextMenu(e);
    }
  }

  renderSecondary = ({
    uri,
    tracks_total,
    followers,
    albums_uris,
    artists,
  }) => {
    switch (uriType(uri)) {
      case 'playlist':
        return (
          <span className="grid__item__secondary__content">
            <I18n path="specs.tracks" count={tracks_total || 0} />
          </span>
        );

      case 'artist':
        return (
          <span className="grid__item__secondary__content">
            {followers && <I18n path="specs.followers" count={followers.toLocaleString()} />}
            {albums_uris && <I18n path="specs.albums" count={albums_uris.length} />}
          </span>
        );

      case 'album':
        return (
          <span className="grid__item__secondary__content">
            {artists && <LinksSentence nolinks items={artists} />}
          </span>
        );

      default:
        return (
          <span className="grid__item__secondary__content">
            {artists && <LinksSentence nolinks items={item.artists} /> }
            {followers && <I18n path="specs.followers" count={followers.toLocaleString()} />}
          </span>
        );
    }
  }

  render = () => {
    const {
      item: { album },
      link: customLink,
      type,
      show_source_icon,
    } = this.props;
    let { item } = this.props;

    if (!item) return null;
    if (album) item = { ...item, ...album };

    const link = customLink || `/${type}/${encodeURIComponent(item.uri)}`;

    return (
      <Link
        className={`grid__item grid__item--${type}`}
        to={link}
        onClick={scrollTo}
        onContextMenu={this.onContextMenu}
      >
        <Thumbnail
          glow
          size="medium"
          className="grid__item__thumbnail"
          images={item.images || item.icons}
          type={type}
        />
        <div className="grid__item__name">
          {item.name ? item.name : <span className="opaque-text">{item.uri}</span>}
        </div>
        <div className="grid__item__secondary">
          {show_source_icon && (
            <Icon name={sourceIcon(item.uri)} type="fontawesome" className="source" />
          )}
          {this.renderSecondary(item)}
        </div>
      </Link>
    );
  }
}
