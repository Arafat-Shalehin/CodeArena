import { Problem } from "@/models/Problem.models";

/**
 * Fetch paginated list of problems with optional filtering.
 *
 * Responsibilities:
 * - Build MongoDB filter object
 * - Apply pagination
 * - Exclude private fields (testCases)
 * - Return structured pagination metadata
 * @param {Object} query - Query parameters (page, limit, difficulty, search) *
 * @returns {Object} - { problems, total, page, pages }
 */
export async function getAllProblems(query) {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(parseInt(query.limit, 10) || 10, 50); // cap limit
  const skip = (page - 1) * limit;

  const filter = {};

  // Filter status
  if (query.difficulty) {
    filter.difficulty = query.difficulty;
  }

  // Filter status
  if (query.search) {
    filter.title = { $regex: query.search, $options: "i" };
  }

  // Running queries in parallel for better performance
  const [problems, total] = await Promise.all([
    Problem.find(filter)
      .select("-testCases")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Problem.countDocuments(filter),
  ]);

  return {
    problems,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  };
}

/**
 * Fetch a single problem by ID.
 *
 * @param {String} id - MongoDB ObjectId
 * @param {Object} options - Optional flags
 * @param {Boolean} options.includeTestCases - Whether to include test cases
 */
export async function getProblemById(id, { includeTestCases = false } = {}) {
  const query = Problem.findById(id);

  if (!includeTestCases) {
    query.select("-testCases");
  }

  const problem = await query;

  if (!problem) {
    const error = err.status = 404;
    error.message = "Problem not found";
    throw error;
  }

  return problem;
}

/**
 * Create a new problem
 * Validation is primarily handled by Mongoose schema.
 * @param {Object} data - Problem data
 * @returns {Object} - Created problem
 */
export async function createProblem(data) {
  return await Problem.create(data);
}

/**
 * Update a problem
 * @param {String} id - Problem ID
 * @param {Object} data - Update data
 * @returns {Object} - Updated problem
 */
export async function updateProblem(id, data) {
  const problem = await Problem.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });

  if (!problem) {
    const error = err.status = 404;
    error.message = "Problem not found";
    throw error;
  }

  return problem;
}

/**
 * Delete a problem
 * @param {String} id - Problem ID
 * @returns {Object} - Deleted problem
 */
export async function deleteProblem(id) {
  const problem = await Problem.findByIdAndDelete(id);

  if (!problem) {
    const error = err.status = 404;
    error.message = "Problem not found";
    throw error;
  }

  return problem;
}
