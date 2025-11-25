const express = require("express");
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  addReview,
  getBrands,
  deleteProduct
} = require("../controllers/productController");
const { protect, admin } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", getProducts);
router.get("/:id", getProductById);
router.get('/filters/brands', getBrands);
router.post("/", protect, admin, createProduct);
router.put("/:id", protect, admin, updateProduct);
router.post("/:id/review", protect, addReview);
router.delete("/:id", protect, admin, deleteProduct);

module.exports = router;
