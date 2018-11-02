/*
 * @description  格式化日期
*/
const minuteTime = 60 * 1000
const hourTime = 60 * 60 * 1000
const dayTime = 24 * 60 * 60 * 1000
const weekTime = 7 * 24 * 60 * 60 * 1000
const monthTime = 30 * 24 * 60 * 60 * 1000

function relativeTime(date){
  const dateTime = new Date(date)
  const now = new Date()
  const diffTime = now.getTime() - dateTime.getTime()
  let relativeTime = 'Updated '
  if(diffTime > monthTime) {
    relativeTime += "on "+dateTime.getFullYear()+"/"+(dateTime.getMonth()+1)+"/"+dateTime.getDate()
  } else if(diffTime > weekTime) {
    const manyweek = Math.floor(diffTime/weekTime)
    relativeTime += ` ${manyweek} ${manyweek>0?'weeks':'week'} ago`
  } else if(diffTime > dayTime){
    const manyday = Math.floor(diffTime/dayTime)
    relativeTime += ` ${manyday} ${manyday>0?'days':'day'} ago`
  } else if(diffTime > hourTime){
    const manyhour = Math.floor(diffTime/hourTime)
    relativeTime += ` ${manyhour} ${manyhour>0?'hours':'hour'} ago`
  } else if(diffTime > minuteTime){
    const manyminute = Math.floor(diffTime/minuteTime)
    relativeTime += ` ${manyminute} ${manyminute>0?'minutes':'minutes'} ago`
  }else{
    relativeTime += ' just now'
  }
  return relativeTime
}

export {
  relativeTime
}
