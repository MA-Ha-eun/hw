import express from "express" // index.js에서 가져옴
import userRouter from "./routers/user.router.js"
import postRouter from './routers/post.router.js'

const PORT = 4000;
const app = express();
app.use(express.json());

app.use('/', userRouter);
app.use('/', postRouter);

app.listen(PORT, () => {
  console.log(`Start server! http://localhost:${PORT}`);
});