const express = require("express");
const router = express.Router();

router.get("/privacy",(req,res)=>{
    res.render("footer/privacy.ejs")
});

router.get("/terms",(req,res)=>{
    res.render("footer/terms.ejs")
});

router.get("/companyDetails",(req,res)=>{
    res.render("footer/companyDetails.ejs")
});

module.exports = router;