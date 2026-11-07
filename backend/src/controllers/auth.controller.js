export const register = (req, res) => {
  const { name, email } = req.body;

  return res.status(501).json({
    success: false,
    message: "Registration is not implemented yet",
    data: {
      name,
      email
    }
  });
};