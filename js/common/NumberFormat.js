export function commaSplit(int){
  if(typeof int !== 'number'){
    return int;
  }
  const len = int.toString().length
  const threeMul = Math.floor(len / 3)
  const mod = len % 3
  const num = int.toString()
  if(threeMul === 0){
    return num
  }else{
    let result = ''
    if(mod !== 0){
      result = num.substring(0, mod)
    }
    for(let i = 0; i < threeMul; i++){
      result += ((mod ===0 && i===0) ? '' : ',')+num.substring(mod + i*3, (mod + (i+1)*3))
    }
    return result
  }
}
