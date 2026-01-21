const fileInput = document.getElementById("fileInput");
const content = document.getElementById("content");

let SQL;

initSqlJs({
  locateFile: file => 
    `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`
}).then(sql => {
  SQL = sql;
});

fileInput.addEventListener("change", async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const buffer = await file.arrayBuffer();
  const db = new SQL.Database(new Uint8Array(buffer));

  // Obtener nombre de la única tabla
  const tables = db.exec(
    "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';"
  );

  if (!tables.length) {
    content.innerHTML = "<p>No se encontraron tablas.</p>";
    return;
  }

  const tableName = tables[0].values[0][0];

  // Leer todo
  const result = db.exec(`SELECT * FROM "${tableName}"`);
  if (!result.length) {
    content.innerHTML = "<p>Tabla vacía.</p>";
    return;
  }

  const columns = result[0].columns;
  const rows = result[0].values;

  // Asumimos que la primera columna es ID → NO se muestra
  const visibleColumns = columns.slice(1);

  let html = `<h2>Tabla: ${tableName}</h2>`;
  html += `<div class="table-container"><table><thead><tr>`;

  visibleColumns.forEach(col => {
    html += `<th>${col}</th>`;
  });

  html += `</tr></thead><tbody>`;

  rows.forEach(row => {
    html += "<tr>";
    row.slice(1).forEach(cell => {
      html += `<td>${cell ?? ""}</td>`;
    });
    html += "</tr>";
  });

  html += "</tbody></table></div>";

  content.innerHTML = html;
});
