import { query } from "../db/database.js";

export async function create({
  city,
  country,
  start_at,
  end_at = null,
  expected_end_at,
  comment = null,
  accommodation = null,
}) {
  const result = await query(
    `
    INSERT INTO stays (
      city,
      country,
      start_at,
      end_at,
      expected_end_at,
      comment,
      accommodation
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *;
    `,
    [city, country, start_at, end_at, expected_end_at, comment, accommodation],
  );
  return result.rows[0].id;
}

export async function findAll() {
  const stays = await query("SELECT * FROM stays");
  return stays.rows[0];
}

export async function findById(id) {
  const stay = await query("SELECT * FROM stays WHERE id = $1", [id]);
  return stay.rows[0];
}

export async function remove(id) {
  const result = await query("DELETE FROM stays WHERE id = $1", [id]);
  return result.rowCount; // should be 1
}

export async function update(
  id,
  params, // { expected_end_at, end_at, start_at, comment, accommodation }
) {
  let setClauses = [];
  let queryValues = [];
  let idx = 1;

  // TODO: params.length = 0인 경우의 에러 핸들링
  // TODO: params 타입 지정 (TS 리팩토링)
  for (const [key, value] of Object.entries(params)) {
    setClauses.push(`${key} = $${idx}`);
    queryValues.push(value);
    idx++;
  }

  queryValues.push(id);
  const result = await query(
    `UPDATE stay
  SET ${setClauses.join(", ")}
  WHERE id = $${idx}`,
    queryValues,
  );

  return result.rowCount; // should be 1
}
