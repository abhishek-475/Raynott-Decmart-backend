const Product = require("../models/Product");


exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find({});
    res.json(products);
  } catch (err) {
    console.error("GET PRODUCTS ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};


exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product)
      return res.status(404).json({ message: "Product not found" });

    res.json(product);
  } catch (err) {
    console.error("GET PRODUCT ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};


exports.createProduct = async (req, res) => {
  try {
    const {
      name,
      price,
      description,
      brand,
      category,
      countInStock,
      image,
    } = req.body;

    const product = await Product.create({
      name,
      price,
      description,
      brand,
      category,
      countInStock,
      image,
    });

    res.status(201).json(product);
  } catch (err) {
    console.error("CREATE PRODUCT ERROR:", err);
    res.status(500).json({ message: "Product creation failed" });
  }
};



exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;   

    const {
      name,
      price,
      description,
      brand,
      category,
      countInStock,
      image
    } = req.body;               

    const updated = await Product.findByIdAndUpdate(
      id,
      {
        name,
        price,
        description,
        brand,
        category,
        countInStock,
        image
      },
      { new: true }
    );

    if (!updated)
      return res.status(404).json({ message: "Product not found" });

    res.json(updated);
  } catch (err) {
    console.error("UPDATE PRODUCT ERROR:", err);
    res.status(500).json({ message: "Product update failed" });
  }
};


exports.addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const {id} = req.params

    const product = await Product.findById(id);

    if (!product)
      return res.status(404).json({ message: "Product not found" });

    // Check duplicate review
    const reviewed = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (reviewed)
      return res.status(400).json({ message: "Already reviewed this product" });

    // Create review
    const review = {
      user: req.user._id,
      name: req.user.name,
      rating: Number(rating),
      comment,
    };

    product.reviews.push(review);

    // Update review count
    product.numReviews = product.reviews.length;

    // Update average rating
    product.rating =
      product.reviews.reduce((sum, r) => sum + r.rating, 0) /
      product.reviews.length;

    await product.save();

    res.status(201).json({ message: "Review added successfully" });
  } catch (err) {
    console.error("ADD REVIEW ERROR:", err);
    res.status(500).json({ message: "Review submit failed" });
  }
};

exports.getBrands = async (req, res) => {
  try {
    const brands = await Product.distinct('brand');
    res.json(brands);
  } catch (err) {
    console.error("GET BRANDS ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Delete product
    await product.deleteOne();

    res.json({ message: "Product deleted successfully" });

  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ message: "Server error" });
  }
};


exports.getCategories = async (req, res) => {
  try {
    const categories = await Product.distinct("category");
    res.json(categories);
  } catch (err) {
    console.error("GET CATEGORIES ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};
