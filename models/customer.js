/** Customer for Lunchly */

const db = require("../db");
const Reservation = require("./reservation");

/** Customer of the restaurant. */

class Customer {
  constructor({ id, firstName, lastName, phone, notes }) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.phone = phone;
    this.notes = notes;
    this.fullName=this.fullName()
  }

  // generate a full name for a customer by concating first and last name with a space
  fullName(){
    console.log(this.firstName.concat(' ', this.lastName));
    let fullName=this.firstName.concat(' ',this.lastName)
    return fullName
  }


  /** find all customers. */

  static async all() {
    const results = await db.query(
      `SELECT id, 
         first_name AS "firstName",  
         last_name AS "lastName", 
         phone, 
         notes
       FROM customers
       ORDER BY last_name, first_name`
    );
    console.log("this is results.rows for all customer query ----->",results.rows)
    return results.rows.map(c => new Customer(c));
  }

  // CREATE TABLE customers (
//     id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
//     first_name text NOT NULL,
//     last_name text NOT NULL,
//     phone text,
//     notes text DEFAULT '' NOT NULL
// );

// CREATE TABLE reservations (
//     id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
//     customer_id integer NOT NULL REFERENCES customers,
//     start_at timestamp without time zone NOT NULL,
//     num_guests integer NOT NULL,
//     notes text DEFAULT '' NOT NULL,
//     CONSTRAINT reservations_num_guests_check CHECK ((num_guests > 0))
// );

  static async topCustomers(){
    const results=await db.query(`SELECT c.id AS "customer_id", c.first_name AS "firstName", c.last_name AS "lastName", c.phone, c.notes, COUNT(*) AS "total_reservations"
    FROM customers as c LEFT JOIN reservations r ON c.id=r.customer_id GROUP BY c.id, c.first_name, c.last_name ORDER BY total_reservations DESC LIMIT 10;`)
    console.log("this is results.rows top customers query ----->",results.rows)
    return results.rows.map(c => new Customer({id:c.customer_id, firstName:c.firstName, lastName:c.lastName, phone:c.phone, notes:c.notes}));
  }
  /** get a customer by ID. */

  static async get(id) {
    const results = await db.query(
      `SELECT id, 
         first_name AS "firstName",  
         last_name AS "lastName", 
         phone, 
         notes 
        FROM customers WHERE id = $1`,
      [id]
    );

    const customer = results.rows[0];

    if (customer === undefined) {
      const err = new Error(`No such customer: ${id}`);
      err.status = 404;
      throw err;
    }

    return new Customer(customer);
  }

  // look up a customer by name using a first and last name redirects to found customer detail page
  static async searchCustomerFirstAndLastName(customerFirstName, customerLastName){
    console.log("inside searchCustomerFirstAndLastName")
    const results=await db.query(`SELECT id, first_name AS "firstName", last_name AS "lastName", phone, notes FROM customers WHERE first_name ILIKE $1 and last_name ILIKE $2 `,[`%${customerFirstName}%`,`%${customerLastName}%`])
    console.log("this is results.rows[0] of searchCustomer---->", results.rows[0])
    const customer = results.rows[0];
    
    if (customer === undefined) {
      const err = new Error(`No customers found for search: ${customerFirstName}, ${customerLastName}`);
      err.status = 404;
      throw err;
    }
    let newCustomer=new Customer(customer)
    console.log("this is the new instance of customer", newCustomer)
    return newCustomer
  }
// look up customer by name using first name only. It is possible to get multiple results here so we will redirect to a unique search results page(modeled after customer_list.html) for this one 
  static async searchCustomerFirstNameOnlY(customerFirstName){
    console.log("inside searchCustomerFirstNameOnlY")
    const results=await db.query(`SELECT id, first_name AS "firstName", last_name AS "lastName", phone, notes FROM customers WHERE first_name ILIKE $1 `,[`%${customerFirstName}%`])
    console.log("this is results.rows of searchCustomerFirstNameOnlY---->", results.rows)
    const customers = results.rows
    console.log("this is customers",customers)
    if (customers.length === 0) {
      const err = new Error(`No customers found for search: ${customerFirstName}`);
      err.status = 404;
      throw err;
    }

    const newCustomers=customers.map(c=>new Customer({id:c.id, firstName:c.firstName, lastName:c.lastName, phone:c.phone, notes:c.notes}))
    console.log("this is the array of found customer instances", newCustomers)
    return newCustomers
  }

  /** get all reservations for this customer. */

  async getReservations() {
    return await Reservation.getReservationsForCustomer(this.id);
  }

  /** save this customer. */

  async save() {
    if (this.id === undefined) {
      const result = await db.query(
        `INSERT INTO customers (first_name, last_name, phone, notes)
             VALUES ($1, $2, $3, $4)
             RETURNING id`,
        [this.firstName, this.lastName, this.phone, this.notes]
      );
      this.id = result.rows[0].id;
    } else {
      await db.query(
        `UPDATE customers SET first_name=$1, last_name=$2, phone=$3, notes=$4
             WHERE id=$5`,
        [this.firstName, this.lastName, this.phone, this.notes, this.id]
      );
    }
  }
}



module.exports = Customer;
