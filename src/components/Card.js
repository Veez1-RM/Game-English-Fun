import React from 'react';
import styled from 'styled-components';

const Card = ({ backIcon, backText, frontImage }) => {
  return (
    <StyledWrapper>
      <div className="card">
        <div className="content">
          {/* BACK SIDE */}
          <div className="back">
            <div className="back-content">
              {backIcon && <div className="icon-wrapper">{backIcon}</div>}
              {backText && <strong className="back-text">{backText}</strong>}
            </div>
          </div>

          {/* FRONT SIDE */}
          <div className="front">
            <div className="front-content">
              {frontImage && (
                <img src={frontImage} alt="card front" className="front-image" />
              )}
            </div>
          </div>
        </div>
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .card {
    overflow: visible;
    width: 243px;
    height: 324px;
  }

  .content {
    width: 100%;
    height: 100%;
    transform-style: preserve-3d;
    transition: transform 300ms;
    box-shadow: 0px 0px 10px 1px #7600adee;
    border-radius: 5px;
    position: relative;
  }

  .front, .back {
    background-color: #150126ff;
    position: absolute;
    width: 100%;
    height: 100%;
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
    border-radius: 5px;
    overflow: hidden;
  }

  .back {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .back::before {
    position: absolute;
    content: ' ';
    display: block;
    width: 160px;
    height: 160%;
    background: linear-gradient(90deg, transparent, #3b0149ff, #590082ff, #b100c1ff, #c654ffff, transparent);
    animation: rotation_481 5000ms infinite linear;
  }

  .back-content {
    position: absolute;
    width: 99%;
    height: 99%;
    background-color: #160c1eff;
    border-radius: 5px;
    color: white;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 15px;
  }

  .icon-wrapper {
    width: 50px;
    height: 50px;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .icon-wrapper svg {
    width: 100%;
    height: 100%;
    fill: #ffffff;
  }

  .back-text {
    font-size: 16px;
    font-weight: bold;
  }

  .card:hover .content {
    transform: rotateY(180deg);
  }

  @keyframes rotation_481 {
    0% { transform: rotateZ(0deg); }
    100% { transform: rotateZ(360deg); }
  }

  .front {
    transform: rotateY(180deg);
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .front-content {
    width: 100%;
    height: 100%;
  }

  .front-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

export default Card;
