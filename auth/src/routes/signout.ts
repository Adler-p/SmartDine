import express from 'express';

const router: express.Router = express.Router();

router.post('/api/users/signout', async (req, res) => {
  // 清除 session 和 refreshToken cookie
  req.session = null; // 清除 session，针对 cookie-session 库
  
  // 清除自定义设置的 cookie
  res.clearCookie('session');
  res.clearCookie('refreshToken');

  res.status(200).send({ message: 'User successfully logged out' });
});

export { router as signoutRouter };
