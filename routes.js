/** Routes for Lunchly */

const express = require("express");

const Customer = require("./models/customer");
const Reservation = require("./models/reservation");

const router = new express.Router();

/** Homepage: show list of customers. */

router.get("/", async function(req, res, next) {
  try {
    const customers = await Customer.all();
    return res.render("customer_list.html", { customers });
  } catch (err) {
    return next(err);
  }
});

router.get("/top", async function(req,res,next){
  try{
    const customers=await Customer.topCustomers();
    console.log("this is customers---->", customers)
    return res.render("top_customers.html", {customers})

  }
  catch(err){
    return next(err)
  }
  
}) 

router.get("/search", async function(req,res,next){
  try{
    let customerFullName=req.query.search;
    console.log("this is /search req.query",req.query)
    console.log("this is customerFullName",req.query.search)
    const [customerFirstName, customerLastName] = customerFullName.split(' ', 2);
    console.log("this is customerFirstName", customerFirstName)
    console.log("this is customerLastName",customerLastName)
    if(customerFirstName && customerLastName){
      const customer=await Customer.searchCustomerFirstAndLastName(customerFirstName,customerLastName);
      return res.redirect(`/${customer.id}/`)
    }
    else{
      const customers=await Customer.searchCustomerFirstNameOnlY(customerFirstName)
      return res.render("search_results.html", { customers });
    }
  }
  catch(err){
    return next(err)
  }
})



/** Form to add a new customer. */

router.get("/add/", async function(req, res, next) {
  try {
    return res.render("customer_new_form.html");
  } catch (err) {
    return next(err);
  }
});

/** Handle adding a new customer. */

router.post("/add/", async function(req, res, next) {
  try {
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const phone = req.body.phone;
    const notes = req.body.notes;

    const customer = new Customer({ firstName, lastName, phone, notes });
    await customer.save();

    return res.redirect(`/${customer.id}/`);
  } catch (err) {
    return next(err);
  }
});

/** Show a customer, given their ID. */

router.get("/:id/", async function(req, res, next) {
  try {
    const customer = await Customer.get(req.params.id);

    const reservations = await customer.getReservations();

    return res.render("customer_detail.html", { customer, reservations });
  } catch (err) {
    return next(err);
  }
});

/** Show form to edit a customer. */

router.get("/:id/edit/", async function(req, res, next) {
  try {
    const customer = await Customer.get(req.params.id);

    res.render("customer_edit_form.html", { customer });
  } catch (err) {
    return next(err);
  }
});

/** Handle editing a customer. */

router.post("/:id/edit/", async function(req, res, next) {
  try {
    const customer = await Customer.get(req.params.id);
    customer.firstName = req.body.firstName;
    customer.lastName = req.body.lastName;
    customer.phone = req.body.phone;
    customer.notes = req.body.notes;
    await customer.save();

    return res.redirect(`/${customer.id}/`);
  } catch (err) {
    return next(err);
  }
});


/** Handle adding a new reservation. */

router.post("/:id/add-reservation/", async function(req, res, next) {
  try {
    const customerId = req.params.id;
    // const startAt = new Date(req.body.startAt); only serves to screw up formatting seems like.Buggy line
    const startAt=req.body.startAt
    console.log("this is startAt before formatting req.body.startAt", req.body.startAt)
    const numGuests = req.body.numGuests;
    const notes = req.body.notes;
    // console.log("this is type of customerId----->",typeof(customerId))
    // console.log("this is type of startAt----->",typeof(startAt))
    // console.log("this is type of numGuests----->",typeof(numGuests))
    // console.log("this is type of notes----->",typeof(notes))

    const reservation = new Reservation({
      customerId,
      startAt,
      numGuests,
      notes
    });
    console.log(reservation)

    await reservation.saveReservation();

    return res.redirect(`/${customerId}/`);
  } catch (err) {
    return next(err);
  }
});



module.exports = router;

