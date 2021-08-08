const coinFlip = ()=>{
    return Math.round(Math.random());
}
const getRandomFromArray = (arr)=> {
    return arr[Math.floor(Math.random() * (arr.length))] 
  }

module.exports = {coinFlip, getRandomFromArray}