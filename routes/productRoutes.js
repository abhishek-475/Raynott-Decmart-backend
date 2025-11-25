const express = require("express");
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  addReview,
  getBrands,
  getCategories,
  deleteProduct
} = require("../controllers/productController");
const { protect, admin } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", getProducts);
router.get("/categories", getCategories);
router.get("/filters/brands", getBrands);
router.get("/:id", getProductById);

router.post("/", protect, admin, createProduct);
router.put("/:id", protect, admin, updateProduct);
router.delete("/:id", protect, admin, deleteProduct);
router.post("/:id/review", protect, addReview);


module.exports = router;
