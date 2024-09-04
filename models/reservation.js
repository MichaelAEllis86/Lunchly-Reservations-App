/** Reservation for Lunchly */

const moment = require("moment");

const db = require("../db");


/** A reservation for a party */

class Reservation {
  constructor({id, customerId, numGuests, startAt, notes}) {
    this.id = id;
    this.customerId = customerId;
    this.numGuests = numGuests;
    this.startAt = startAt;
    this.notes = notes;
  }

  /** formatter for startAt */

  getformattedStartAt() {
    return moment(this.startAt).format('MMMM Do YYYY, h:mm a');
  }

  getformattedStartAtForDatabase() {
    return moment(this.startAt).format('YYYY-MM-DD HH:mm:ss');
  }

  /** given a customer id, find their reservations. */

  static async getReservationsForCustomer(customerId) {
    const results = await db.query(
          `SELECT id, 
           customer_id AS "customerId", 
           num_guests AS "numGuests", 
           start_at AS "startAt", 
           notes AS "notes"
         FROM reservations 
         WHERE customer_id = $1`,
        [customerId]
    );

    return results.rows.map(row => new Reservation(row));
  }

 async saveReservation(){
    // this.customerId=this.customerId
    // console.log("final customer id",this.customerId)
    // // this.startAt=this.getformattedStartAtForDatabase()
    // console.log("final startAt",this.startAt, typeof(this.startAt))
    // this.numGuests=Number(this.numGuests)
    // console.log("final numGuests",this.numGuests,typeof(this.numGuests))
    const results=await db.query(`INSERT INTO reservations (customer_id, start_at, num_guests, notes) VALUES($1, $2, $3, $4) RETURNING id, customer_id, start_at, num_guests, notes`, [this.customerId,this.startAt,this.numGuests,this.notes])
    console.log("this is results.rows[0] for new the Reservation----->", results.rows[0])
    
  }
}
  

module.exports = Reservation;

