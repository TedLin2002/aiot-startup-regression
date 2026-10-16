# 創業數據實驗室｜多元線性迴歸

以繁體中文呈現的 50 Startups 資料分析互動網站，適合直接部署到 GitHub Pages。此專題涵蓋多元線性迴歸、特徵選擇、模型表現比較、獲利預測與測試集殘差診斷。

## 在本機預覽

以瀏覽器開啟 `index.html` 即可瀏覽。網站使用原生 HTML、CSS、JavaScript 和 Canvas，不需要安裝套件或建置步驟。

## GitHub Pages 發佈

1. 將此資料夾內容放入 GitHub 儲存庫的根目錄。
2. 在儲存庫的 **Settings → Pages** 選擇 **Deploy from a branch**。
3. 選擇 `main` 分支與 `/(root)` 資料夾並儲存，等待部署完成。

## 資料與解讀

- 資料集：[50 Startups Dataset](https://github.com/Avik-Jain/100-Days-Of-ML-Code/blob/master/datasets/50_Startups.csv)
- 流程架構：CRISP-DM
- 模型摘要、係數與殘差表中的數字依參考案例作為課堂展示資料。不同特徵選擇方法的比較曲線為互動教學示意值；網站不會重新讀取 CSV 或重新訓練統計模型。頁面上的預測器依基準模型方程式即時試算。
