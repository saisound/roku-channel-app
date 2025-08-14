import * as React from 'react';
import './index.css'

import { imgUrlSuffix360w } from '../../constants'

const defaultImage = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB3aWR0aD0iNzUycHQiIGhlaWdodD0iNzUycHQiIHZlcnNpb249IjEuMSIgdmlld0JveD0iMCAwIDc1MiA3NTIiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiA8Zz4KICA8cGF0aCBkPSJtMjI4LjI1IDUwMC41NWgxMS44NHYzNS41MmgtMTEuODR6Ii8+CiAgPHBhdGggZD0ibTIyOC4yNSA0NTMuMmgxMS44NHYzNS41MmgtMTEuODR6Ii8+CiAgPHBhdGggZD0ibTIyOC4yNSA0MDUuODRoMTEuODR2MzUuNTJoLTExLjg0eiIvPgogIDxwYXRoIGQ9Im0yMjguMjUgNTQ3LjkxaDExLjg0djM1LjUyaC0xMS44NHoiLz4KICA8cGF0aCBkPSJtNDM1LjIgNTc3LjI3aDM1LjUydjExLjg0aC0zNS41MnoiLz4KICA8cGF0aCBkPSJtMzg3Ljg0IDU3Ny4yN2gzNS41MnYxMS44NGgtMzUuNTJ6Ii8+CiAgPHBhdGggZD0ibTIyOC4yNSAzNTguNDhoMTEuODR2MzUuNTJoLTExLjg0eiIvPgogIDxwYXRoIGQ9Im0yNDUuNzcgNTc3LjI3aDM1LjUydjExLjg0aC0zNS41MnoiLz4KICA8cGF0aCBkPSJtMjUyLjg3IDE2Mi44OWgtMjQuNjI1djQxLjY3NmgxMS44MzZ2LTI5LjgzNmgxMi43ODl6Ii8+CiAgPHBhdGggZD0ibTI2NC43MSAxNjIuODloMzUuNTJ2MTEuODRoLTM1LjUyeiIvPgogIDxwYXRoIGQ9Im0yMjguMjUgMzExLjEyaDExLjg0djM1LjUyaC0xMS44NHoiLz4KICA8cGF0aCBkPSJtMjkzLjEyIDU3Ny4yN2gzNS41MnYxMS44NGgtMzUuNTJ6Ii8+CiAgPHBhdGggZD0ibTIyOC4yNSAyMTYuNDFoMTEuODR2MzUuNTJoLTExLjg0eiIvPgogIDxwYXRoIGQ9Im0yMjguMjUgMjYzLjc2aDExLjg0djM1LjUyaC0xMS44NHoiLz4KICA8cGF0aCBkPSJtMzQwLjQ4IDU3Ny4yN2gzNS41MnYxMS44NGgtMzUuNTJ6Ii8+CiAgPHBhdGggZD0ibTUwOS41NSAyNTcuNjEgMi44NDM4IDIuMzY3MnYyNy40NjloMTEuODM2di0zMi4yMDNsLTYuMTU2Mi02LjE1NjJ6Ii8+CiAgPHBhdGggZD0ibTUxMi4zOSAyOTkuMjhoMTEuODR2MzUuNTJoLTExLjg0eiIvPgogIDxwYXRoIGQ9Im00MDYuNzkgMTYyLjg5djExLjg0aDE5Ljg5MWw3LjU3NDIgNy41NzgxIDguNTI3My04LjUyNzMtMTAuODk1LTEwLjg5MXoiLz4KICA8cGF0aCBkPSJtNDUxLjEgMTgyLjQyIDI1LjExMyAyNS4xMTMtOC4zNzExIDguMzcxMS0yNS4xMTMtMjUuMTEzeiIvPgogIDxwYXRoIGQ9Im00ODQuNTkgMjE1LjQzIDI1LjExMyAyNS4xMTMtOC4zNzExIDguMzcxMS0yNS4xMTMtMjUuMTEzeiIvPgogIDxwYXRoIGQ9Im01MTIuMzkgMzQ2LjY0aDExLjg0djM1LjUyaC0xMS44NHoiLz4KICA8cGF0aCBkPSJtNTEyLjM5IDQ0MS4zNmgxMS44NHYzNS41MmgtMTEuODR6Ii8+CiAgPHBhdGggZD0ibTUxMi4zOSA1MzYuMDdoMTEuODR2MzUuNTJoLTExLjg0eiIvPgogIDxwYXRoIGQ9Im00ODIuNTYgNTc3LjI3aDM1LjUydjExLjg0aC0zNS41MnoiLz4KICA8cGF0aCBkPSJtMzU5LjQzIDE2Mi44OWgzNS41MnYxMS44NGgtMzUuNTJ6Ii8+CiAgPHBhdGggZD0ibTUxMi4zOSAzOTRoMTEuODR2MzUuNTJoLTExLjg0eiIvPgogIDxwYXRoIGQ9Im0zMTIuMDcgMTYyLjg5aDM1LjUydjExLjg0aC0zNS41MnoiLz4KICA8cGF0aCBkPSJtNTEyLjM5IDQ4OC43MWgxMS44NHYzNS41MmgtMTEuODR6Ii8+CiAgPHBhdGggZD0ibTQ1NS41NiA0MTEuNTItMzUuNTItMzUuNTIgMzUuNTItMzUuNTItNDQuMDQzLTQ0LjA0My0zNS41MiAzNS41Mi0zNS41Mi0zNS41Mi00NC4wNDMgNDQuMDQzIDM1LjUyIDM1LjUyLTM1LjUyIDM1LjUyIDQ0LjA0MyA0NC4wNDMgMzUuNTItMzUuNTIgMzUuNTIgMzUuNTJ6bS0xMTUuMDggMjYuOTk2LTI2Ljk5Mi0yNi45OTIgMzUuNTItMzUuNTItMzUuNTItMzUuNTIgMjYuOTkyLTI2Ljk5MiAzNS41MiAzNS41MiAzNS41Mi0zNS41MiAyNi45OTIgMjYuOTkyLTM1LjUyIDM1LjUxNiAzNS41MiAzNS41Mi0yNi45OTIgMjYuOTkyLTM1LjUyMy0zNS41MTZ6Ii8+CiAgPHBhdGggZD0ibTQ2OC4zNSAyNTcuNjFoMjYuMDQ3djExLjg0aC0yNi4wNDd6Ii8+CiAgPHBhdGggZD0ibTQxNy42OCAyNjkuNDVoMzEuNzN2LTExLjg0aC0xOS44OTF2LTE5Ljg5MWgtMTEuODR6Ii8+CiAgPHBhdGggZD0ibTQxNy42OCAxOTIuNzNoMTEuODR2MjYuMDQ3aC0xMS44NHoiLz4KIDwvZz4KPC9zdmc+Cg=='

const ImageTile = ({ imageURL = false, title, id, numMatches, expanded, handleShowMore, handleViewDetails, hideViewMore, type, fillMode }) => {

  const [blinking, setBlinking] = React.useState(false);

  const handleImageClick = async () => {
    if (imageURL) {
      setBlinking(true)
      parent.postMessage({
        pluginMessage: { type: 'get selection for insertion', imageURL, id, fillMode }
      }, '*')
    }
  }

  return (
    <div className={`image-tile ${expanded ? 'expanded' : ''}`} >
      {imageURL ? null : <p className="image-tile-title">
        {title}<br />
        <span style={{ fontWeight: 400 }}>No matching images</span>
      </p>}
      <img
        className={blinking ? 'blinking' : ''}
        onAnimationEnd={() => setBlinking(false)}
        onClick={handleImageClick}
        src={imageURL ? imageURL + imgUrlSuffix360w : defaultImage}
      />
      {numMatches > 1 ? (
        <button className='show-more-button' onClick={handleShowMore}>
          {expanded ? `hide ${numMatches} matching images` : `show ${numMatches} matching images`}
        </button>
      ) : null}
      {hideViewMore ? null : (
        <button className='view-details-button' onClick={handleViewDetails}>
          <svg width="9" height="14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 1.5 7 7l-6 5.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      )}
      {type ? (
        <div className='image-tile-type'>
          {type}
        </div>
      ) : null}


    </div>
  );
}

export default ImageTile;