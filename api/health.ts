import { vercelHandler } from './_adapter.js';

export default vercelHandler('/api/health');

// Thời gian chạy tối đa của hàm (giây): AI có thể trả lời chậm.
export const config = { maxDuration: 300 };
