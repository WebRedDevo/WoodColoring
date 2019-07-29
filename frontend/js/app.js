import svgSprite from './inc/svgSprite'
import loadingLogin from './loading/loadingLogin'
//import anime from 'animejs'

loadingLogin()
svgSprite()


const initialScreen = document.getElementsByClassName('section--initial-screen')[0]
const slideImg = document.getElementsByClassName('slide__img')[0]
const widthScreen = document.documentElement.offsetWidth
const heightScreen = document.documentElement.offsetHeight
document.addEventListener('mousemove', function(e){
  const y = Math.round(e.clientY / widthScreen * 25)
  const x = Math.round(e.clientX / heightScreen * 25)

  
  slideImg.style.transform = `translate3d(${460 + x}px,${y}px,0) scale(1.1)`
})
