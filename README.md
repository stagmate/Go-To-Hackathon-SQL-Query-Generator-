```markdown
# Gojek SQL Query Generator

A lightweight, single-file UI to help generate SQL queries for common Gojek metrics. The tool provides a small, hard-coded metric registry, parameter inputs (date range, product, region), and SQL template rendering you can copy into your query editor.

## Features
- Search metrics by keywords
- Select metric and set parameters (date range, product, region)
- Generate SQL templates populated with chosen parameters
- Copy generated SQL to clipboard

## Files
- `index.html` — main UI + JavaScript. Open in a browser to use.

## Usage
1. Open `index.html` in your browser (double-click or serve with a static server).
2. In the "Ask a question" field, type keywords like `average orders`, `gtv`, or `caretech rating`.
3. Click a metric card to reveal parameter inputs.
4. Adjust the date range, product, and region as needed.
5. Click "Generate SQL Query" and copy the generated SQL.

## Development & Customization
- Metric registry is defined in `index.html` in the `METRIC_REGISTRY` array.
  - Each metric object:
    - `id`, `name`, `description`
    - `keywords` — influences search matching
    - `parameters` — list of expected params (e.g., `dateRange`, `product`, `region`)
    - `sqlTemplate` — a function that accepts params and returns the SQL string
- To add or modify metrics:
  1. Edit `METRIC_REGISTRY` entries.
  2. Update `sqlTemplate` to match your data warehouse table names and fields.

## Notes & Safety
- The SQL templates in this repository reference illustrative table paths (e.g., `p_gojek_prod.final.orders_mart`) and example fields. Before executing generated SQL, ensure table names and field names match your environment.
- This UI is purely client-side; no data is sent to a server.

## Local serving (optional)
To serve locally with a simple static server:
- Python 3: `python -m http.server 8000` then open `http://localhost:8000/index.html`.
- Or use any static file server you prefer.

## License
Add your preferred license or keep repository-specific licensing as needed.

## Contributing
- Open a PR with improvements or add more metrics to the registry.
- For production usage, consider moving the metric registry to a JSON file or backend and adding authentication.
```
