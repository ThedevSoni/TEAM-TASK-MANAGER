// Validates request body, route params, and query params with a Zod schema.
export const validate = (schema) => (req, res, next) => {
  // Collect all request inputs that a route might need to validate.
  const result = schema.safeParse({
    body: req.body,
    params: req.params,
    query: req.query
  });

  // If validation fails, send field-level messages back to the frontend.
  if (!result.success) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: result.error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message
      }))
    });
  }

  // Replace body and params with cleaned values from Zod.
  req.body = result.data.body;
  req.params = result.data.params;
  // Express 5 exposes req.query through a getter, so keep parsed query data on
  // our own request field instead of assigning back to req.query.
  req.validatedQuery = result.data.query;
  next();
};
