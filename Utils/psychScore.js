const nthFib = (n)=> {
    if(n <= 2) return n -1;
    return nthFib(n - 2) + nthFib(n - 1);
}

const psychScore = (n)=>{
    if(n==0)return 0;
    let ans =  nthFib(n+2)*2;
    return ans;
}

module.exports = psychScore;