import express from 'express';

const router: express.Router = express.Router();

router.post('/api/users/signout', async (req, res) => {
  // 简化注销逻辑，仅清除session
  req.session = null;

  res.status(200).send({ message: 'User successfully logged out' });
});

export { router as signoutRouter };
