import { query } from "../db/database.js";

/*
table stays (
    id BIGSERIAL PRIMARY KEY,
    city VARCHAR(100) NOT NULL,
    country VARCHAR(100),
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    start_at DATE,
    end_at DATE,
    expected_end_at DATE,
    comment TEXT,
    accomodation VARCHAR(255)
);
*/

export async function findAll() {
  const stays = await query("SELECT * FROM stays");
  return stays.rows[0];
}

export async function findById(id) {
  const stay = await query("SELECT * FROM stays WHERE id = $1", [id]);
  return stay.rows[0];
}
