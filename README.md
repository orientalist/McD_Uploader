# AWS WorkDocs File Upload

## 簡介
這是一個基於 Node.js 的 AWS Lambda 函數，旨在將文件上傳到 AWS WorkDocs。該函數能夠自動檢查指定資料夾是否存在，並在需要的情況下創建新資料夾，從而確保文件的組織性。

## 功能
- 接收含有文件資料的 HTTP 請求。
- 處理文件的 Base64 編碼並轉換為可上傳的格式。
- 檢查指定資料夾是否存在，如不存在則創建之。
- 上傳文件到指定的 AWS WorkDocs 資料夾中。
- 提供 CORS 支持，以便於跨域請求。

## 安裝與使用方式

1. **前提條件**：
    - Node.js 環境（版本 >= 14.x）
    - AWS 賬戶及其 IAM 配置
    - 安裝 AWS SDK 和其他必要模組

2. **安裝依賴**：
    ```bash
    npm install aws-sdk got
    ```

3. **配置 AWS 憑證**：
    將 AWS 的 `accessKeyId` 和 `secretAccessKey` 填入程式碼中的相應位置，並設定所需的 `region`。

4. **部署到 AWS Lambda**：
    - 將 Lambda 函數代碼上傳至 AWS Lambda。
    - 確保函數具備對 AWS WorkDocs 的相關權限。

5. **觸發 Lambda 函數**：
    - 使用HTTP客戶端發送 POST請求至你的 Lambda 函數 URL，請求的 body 應包含文件的 Base64 編碼及其他必要參數。

## 必要的依賴模組清單
- `aws-sdk`: 使用 AWS 服務 API 進行交互。
- `got`: 用於發送 HTTP 請求上傳文件。

## 授權條款
此專案採用 MIT 許可證。詳細內容可參閱 LICENSE 文件。