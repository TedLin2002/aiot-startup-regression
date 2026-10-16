const modelSets = {
  lasso: {name:"Lasso 排序", rmse:[9264.37,8198.80,8354.12,8589.42,9137.99], r2:[.9182,.9474,.9461,.9413,.9326]},
  sfs: {name:"前向逐步選擇", rmse:[9264.37,8249.63,8392.41,8662.18,9137.99], r2:[.9182,.9468,.9454,.9398,.9326]},
  rfe: {name:"遞迴特徵消除", rmse:[9264.37,8264.27,8433.80,8701.12,9137.99], r2:[.9182,.9465,.9447,.9389,.9326]},
  elastic: {name:"Elastic Net", rmse:[9341.80,8327.19,8502.34,8791.02,9262.45], r2:[.9168,.9453,.9431,.9368,.9291]},
  exhaustive: {name:"窮舉搜尋", rmse:[9264.37,8198.80,8321.54,8518.93,9137.99], r2:[.9182,.9474,.9467,.9424,.9326]}
};
const featureNames = ["R&D Spend", "R&D + Marketing", "R&D + Marketing + Administration", "4 個投入變數", "完整特徵模型"];
const state = {method:"lasso", k:2};
const $ = (selector) => document.querySelector(selector);
const money = (value, decimals=2) => "$" + value.toLocaleString("en-US", {minimumFractionDigits:decimals,maximumFractionDigits:decimals});

function currentSeries() { return state.method === "compare" ? Object.values(modelSets) : [modelSets[state.method]]; }
function render() {
  const data = state.method === "compare" ? modelSets.lasso : modelSets[state.method];
  const index = state.k - 1;
  const score = data.rmse[index];
  const scoreR2 = data.r2[index];
  $("#selectedModel").textContent = `${state.method === "compare" ? "五種方法比較" : data.name}・${state.k} 個特徵`;
  $("#rmse").textContent = money(score);
  $("#r2").textContent = scoreR2.toFixed(4);
  $("#adjR2").textContent = (scoreR2 - [0.0144,0.0150,0.0208,0.0283,0.0412][index]).toFixed(4);
  $("#rmseHint").textContent = state.k === 2 ? "目前比較中的最低值" : state.k === 5 ? "完整模型誤差明顯上升" : "測試集預測誤差";
  $("#insightTitle").textContent = state.k === 2 ? "兩個特徵表現最佳" : state.k === 5 ? "留意特徵過多的影響" : `目前選擇 ${state.k} 個特徵`;
  $("#insightText").textContent = state.k === 2 ? "R&D Spend 與 Marketing Spend 的組合，在這份基準結果中有最低 RMSE。" : state.k === 5 ? "完整模型的測試誤差較高；增加特徵不一定會帶來更好的泛化能力。" : `包含 ${featureNames[index]}，可比較模型複雜度與預測誤差的變化。`;
  $("#insightValue").textContent = `k = ${state.k}`;
  document.querySelectorAll(".method").forEach((button) => {
    const active = button.dataset.method === state.method;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  document.querySelectorAll(".k-picker button").forEach((button) => {
    const active = Number(button.dataset.k) === state.k;
    button.classList.toggle("selected", active);
    button.setAttribute("aria-pressed", String(active));
  });
  drawChart($("#rmseChart"), "rmse", currentSeries());
  drawChart($("#r2Chart"), "r2", currentSeries());
}

function drawChart(canvas, key, series) {
  const rect = canvas.getBoundingClientRect();
  const scale = window.devicePixelRatio || 1;
  canvas.width = Math.max(1, rect.width * scale);
  canvas.height = Math.max(1, rect.height * scale);
  const ctx = canvas.getContext("2d");
  ctx.scale(scale, scale);
  const width = rect.width, height = rect.height;
  const pad = {left:32,right:12,top:9,bottom:20};
  const chartW = width-pad.left-pad.right, chartH=height-pad.top-pad.bottom;
  const all = series.flatMap((item)=>item[key]);
  let min=Math.min(...all), max=Math.max(...all);
  if(key === "r2"){min=Math.floor((min-.006)*100)/100;max=Math.ceil((max+.006)*100)/100;}
  else {min=Math.floor((min-400)/1000)*1000;max=Math.ceil((max+400)/1000)*1000;}
  const x=(i)=>pad.left+i*(chartW/4);
  const y=(value)=>pad.top+(max-value)/(max-min)*chartH;
  ctx.font='8px "DM Mono", monospace';
  ctx.textAlign="right";
  for(let i=0;i<4;i++){
    const value=max-(max-min)*i/3, py=pad.top+chartH*i/3;
    ctx.strokeStyle="#edf1f6";ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(pad.left,py);ctx.lineTo(width-pad.right,py);ctx.stroke();
    ctx.fillStyle="#9ba7b5";ctx.fillText(key === "r2" ? value.toFixed(2) : `${Math.round(value/1000)}k`,pad.left-6,py+3);
  }
  const colors=["#4e8de0","#55a987","#9283d8","#d49a5b","#4dabb1"];
  series.forEach((item,index)=>{
    const values=item[key], color=colors[index];
    ctx.beginPath();ctx.strokeStyle=color;ctx.lineWidth=index===0?2.2:1.5;ctx.lineJoin="round";ctx.lineCap="round";
    values.forEach((value,i)=>i===0?ctx.moveTo(x(i),y(value)):ctx.lineTo(x(i),y(value)));
    ctx.stroke();
    values.forEach((value,i)=>{ctx.beginPath();ctx.fillStyle="#fff";ctx.arc(x(i),y(value),state.k===i+1?4:2.5,0,Math.PI*2);ctx.fill();ctx.lineWidth=1.7;ctx.strokeStyle=color;ctx.stroke();});
  });
  ctx.textAlign="center";ctx.fillStyle="#97a4b4";
  for(let i=0;i<5;i++)ctx.fillText(String(i+1),x(i),height-4);
}

document.querySelectorAll(".method").forEach((button)=>button.addEventListener("click",()=>{state.method=button.dataset.method;render();}));
document.querySelectorAll(".k-picker button").forEach((button)=>button.addEventListener("click",()=>{state.k=Number(button.dataset.k);render();}));

function updatePrediction(){
  const rd=Number($("#rdRange").value), marketing=Number($("#marketingRange").value);
  const rdContribution=rd*.78862, marketingContribution=marketing*.03257547;
  $("#rdOutput").textContent=money(rd,0);$("#marketingOutput").textContent=money(marketing,0);
  $("#rdContribution").textContent="+"+money(rdContribution,0);$("#marketingContribution").textContent="+"+money(marketingContribution,0);
  $("#prediction").textContent=money(46346.34+rdContribution+marketingContribution);
}
$("#rdRange").addEventListener("input",updatePrediction);
$("#marketingRange").addEventListener("input",updatePrediction);
window.addEventListener("resize",render);
render();
