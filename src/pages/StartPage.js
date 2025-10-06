import React, { useContext, useState, useRef,useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameContext } from '../context/GameContext';
import './StartPage.css'
import bolaImage from '../img/bola.png';
import logoCss from '../img/csslogo.png';
import Logor from '../img/Untitled-2.png';
import Card from "../components/Card";
import Rule1 from "../img/Untitled-1.png";
import Rule2 from "../img/Untitled-4.png";
import Rule3 from "../img/Untitled-5.png";
import { FaQuestion } from "react-icons/fa";

const logos = [
  { src: logoCss, alt: "CSS Logo" },
  { src: Logor, alt: "Random Logo" },
  { src: logoCss, alt: "CSS Logo" }, // bisa tambah lagi logo lain
  { src: Logor, alt: "Random Logo" },
  { src: logoCss, alt: "CSS Logo" },
  { src: Logor, alt: "Random Logo" },
  { src: logoCss, alt: "CSS Logo" }, // bisa tambah lagi logo lain
  { src: Logor, alt: "Random Logo" },
  { src: logoCss, alt: "CSS Logo" },
  { src: Logor, alt: "Random Logo" },
  { src: logoCss, alt: "CSS Logo" }, // bisa tambah lagi logo lain
  { src: Logor, alt: "Random Logo" },
];

export default function StartPage(){
  const { teams, setTeamNames, resetGame, setCurrentRound } = useContext(GameContext);
  const [t1, setT1] = useState(teams.team1);
  const [t2, setT2] = useState(teams.team2);
  const navigate = useNavigate();
  const rulesRef = useRef(null);
  const cardRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [scrollDirection, setScrollDirection] = useState("down");
  const lastScrollY = useRef(0);
  const bgmRef = useRef(null);


// ✅ Play BGM saat halaman dimuat
  useEffect(() => {
    const bgm = new Audio('/audio/bg-music.mp3');
    bgm.loop = true;
    bgm.volume = 0.1;

    bgm.play().catch(err => {
      console.warn('Autoplay error:', err);
    });

    bgmRef.current = bgm;

    // Cleanup saat halaman berpindah
    return () => {
      if (bgmRef.current) {
        bgmRef.current.pause();
        bgmRef.current.currentTime = 0;
      }
    };
  }, []);

  const handleScrollToRules = () => {
  const clickSound = new Audio('/audio/click-start.mp3');
  clickSound.volume = 1;
  clickSound.play();

  if (rulesRef.current) {
    const elementBottom = rulesRef.current.getBoundingClientRect().bottom + window.pageYOffset;
    const y = elementBottom - window.innerHeight + 3;
    window.scrollTo({ top: y, behavior: "smooth" });
  }
};


  const handleStart = () => {
    // 🔊 Play sound effect saat "Mulai Game" diklik
    const clickSound = new Audio('/audio/click-start.mp3');
    clickSound.volume = 1;
    clickSound.play().catch(err => console.warn("Click sound gagal:", err));

    // 🎵 Stop background music
    if (bgmRef.current) {
      bgmRef.current.pause();
      bgmRef.current.currentTime = 0;
    }

    // Lanjut ke game
    resetGame();
    setTeamNames(t1, t2);
    setCurrentRound(1);
    navigate('/round1');
  };


  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > lastScrollY.current) {
        setScrollDirection("down");
      } else {
        setScrollDirection("up");
      }
      lastScrollY.current = window.scrollY;
    };
    window.addEventListener("scroll", handleScroll);

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.2 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (cardRef.current) observer.unobserve(cardRef.current);
    };
  }, []);

  return (
    <div className='Full'>
      <div className='bg-c1'></div>
      <div className="hero-section" >
        <img src={bolaImage} alt="decoration" className="decorative-image decorative-image-left" />
        <img src={bolaImage} alt="decoration" className="decorative-image decorative-image-right" />
        <h1 class='Headline'>English Fun Quiz</h1>
        <p className='Sub-Headline'>Learn, Play, and Speak with Confidence</p>
        <button className='button1' onClick={handleScrollToRules}> Start </button>
      </div>

      <div className="logo-marquee">
            <div className="logo-track">
              {/* Track pertama */}
              {logos.map((logo, index) => (
                <img key={index} src={logo.src} alt={logo.alt} />
              ))}
              {/* Track duplikat supaya loop mulus */}
              {logos.map((logo, index) => (
                <img key={`dup-${index}`} src={logo.src} alt={logo.alt} />
              ))}
            </div>
          </div>
      <div className='Rules-container'ref={rulesRef}>
        <div className='Headline-Rule'>
            <p>Rules</p>
        </div>
        <div 
          ref={cardRef} 
          className={`card-container floating 
            ${isVisible ? "visible" : scrollDirection === "up" ? "hidden-up" : ""}`}
        >
          <Card 
            backIcon={<FaQuestion />} 
            backText="First Round" 
            frontImage={Rule1}
          />
          <Card 
            backIcon={<FaQuestion />} 
            backText="Second Round" 
            frontImage={Rule2}
          />
          <Card 
            backIcon={<FaQuestion />} 
            backText="Third Round" 
            frontImage={Rule3}
          />
        </div>
      </div>
      <div >
        <div>
          <label>Nama Kelompok 1</label><br/>
          <input value={t1} onChange={(e) => setT1(e.target.value)} />
        </div>
        <div>
          <label>Nama Kelompok 2</label><br/>
          <input value={t2} onChange={(e) => setT2(e.target.value)} />
        </div>
        <button onClick={handleStart} >Mulai Game</button>
      </div>
    </div>
  );
}
