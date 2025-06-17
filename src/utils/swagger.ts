import { doubleclicksearch_v2 } from "googleapis";
import swaggerJsdoc from "swagger-jsdoc";
import { deserialize } from "v8";

const options: swaggerJsdoc.Options = {
  swaggerDefinition: {
    openapi: "3.1.0",
    info: {
      title: "Backend api",
      description: "Backend  api App",
      license: {
        name: "MIT",
        url: "https://opensource.org/licenses/MIT",
      },
      version: "1.0.0",
    },
    servers: [
      {
        url: "http://localhost:3001/api/v1",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          in: "header",
          name: "authorization",
        },
      },
    },
    consumes: ["application/json"],
    produces: ["application/json"],
    paths: {
      /** user route documentation**/
      "/auth/register": {
        post: {
          summary: "Register a new user",
          tags: ["Authantication"],
          description: "Register a new user with the given email and password",
          requestBody: {
            content: {
              "multipart/form-data": {
                schema: {
                  type: "object",
                  properties: {
                    fname: {
                      type: "string",
                      description: "The user's first name",
                    },
                    lname: {
                      type: "string",
                      description: "The user's last name",
                    },
                    email: {
                      type: "string",
                      format: "email",
                      description: "The user's email address",
                    },
                    password: {
                      type: "string",
                      format: "password",
                      description: "The user's password",
                    },
                    phone: {
                      type: "number",
                      description: "The user's phone number",
                    },
                    image: {
                      type: "string",
                      format: "binary",
                      description: "The user's image",
                    },
                    familyBranch: {
                      type: "string",
                      enum: [
                        "branch_1",
                        "branch_2",
                        "branch_3",
                        "branch_4",
                        "branch_5",
                      ],
                      description: "The user's family branch",
                    },
                    familyRelationship: {
                      type: "string",
                      enum: [
                        "son",
                        "daughter",
                        "wife",
                        "husband",
                        "grandchild",
                        "other",
                      ],
                      description: "The user's family relationship",
                    },
                  },
                  required: [
                    "email",
                    "password",
                    "phone",
                    "familyRelationship",
                    "familyBranch",
                  ],
                },
              },
            },
          },
          responses: {
            "201": {
              description: "User created successfully",
              headers: {
                "Set-Cookie": {
                  description: "HTTP-only cookie containing the access token.",
                  type: "string",
                  example:
                    "accessToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...; HttpOnly; Path=/; Max-Age=3600; SameSite=strict; Secure",
                },
              },
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                      },
                      data: {
                        type: "object",
                      },
                      message: {
                        type: "string",
                      },
                    },
                  },
                },
              },
            },
            "400": {
              description: "Bad Request",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        default: false,
                      },
                      data: {
                        type: "object",
                        default: null,
                      },
                      message: {
                        type: "string",
                      },
                      statusCode: {
                        type: "number",
                        default: 400,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      "/auth/login": {
        post: {
          summary: "User Login",
          tags: ["Authantication"],
          description: "Authenticate user and generate a token",
          requestBody: {
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    identifier: {
                      type: "string",
                      description:
                        "The user's email or phone number. Use email format for email or a numeric string for phone.",
                    },
                    password: {
                      type: "string",
                      format: "password",
                      description: "The user's password",
                    },
                  },
                  required: ["email", "identifer"],
                },
              },
            },
          },
          responses: {
            "200": {
              description: "Successful login",
              headers: {
                "Set-Cookie": {
                  description: "HTTP-only cookie containing the access token.",
                  type: "string",
                  example:
                    "accessToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...; HttpOnly; Path=/; Max-Age=3600; SameSite=strict; Secure",
                },
              },
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                      },
                      data: {
                        type: "object",
                      },
                      message: {
                        type: "string",
                      },
                    },
                  },
                },
              },
            },
            "400": {
              description: "Bad Request",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        default: false,
                      },
                      data: {
                        type: "object",
                        default: null,
                      },
                      message: {
                        type: "string",
                      },
                      statusCode: {
                        type: "number",
                        default: 400,
                      },
                    },
                  },
                },
              },
            },
            "401": {
              description: "Unauthorized",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        default: false,
                      },
                      data: {
                        default: null,
                      },
                      message: {
                        type: "string",
                      },
                      statusCode: {
                        type: "number",
                        default: 401,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      "/auth/logout": {
        post: {
          summary: "User Logout",
          tags: ["Authantication"],
          description: "logout user by deleting token from cookie",
          responses: {
            "200": {
              description: "User successfully logged out",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                      },
                      data: {
                        type: null,
                      },
                      message: {
                        type: "string",
                      },
                    },
                  },
                },
              },
            },
            "400": {
              description: "Bad Request",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        default: false,
                      },
                      data: {
                        type: "object",
                        default: null,
                      },
                      message: {
                        type: "string",
                      },
                      statusCode: {
                        type: "number",
                        default: 400,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },

      /** permission route documentation**/
      "/permission/": {
        post: {
          security: [
            {
              bearerAuth: [],
            },
          ],
          summary: "Check permission",
          tags: ["Permission"],
          description: "check user permission for actions",
          requestBody: {
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    entity: {
                      type: "string",
                      description:
                        "The resource or entity for which permission is being checked (e.g., 'user', 'member')",
                    },
                    action: {
                      type: "string",
                      description:
                        "The type of action requested on the entity (e.g., 'view', 'update', 'create', 'delete').",
                    },
                  },
                  required: ["entity", "action"],
                },
              },
            },
          },
          responses: {
            "201": {
              description: "A new user created sucessfully",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                      },
                      data: {
                        type: null,
                      },
                      message: {
                        type: "string",
                      },
                    },
                  },
                },
              },
            },
            "401": {
              description: "Unauthorized",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        default: false,
                      },
                      data: {
                        type: "object",
                        default: null,
                      },
                      message: {
                        type: "string",
                      },
                      statusCode: {
                        type: "number",
                        default: 401,
                      },
                    },
                  },
                },
              },
            },
            "404": {
              description: "Not Found",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        default: false,
                      },
                      data: {
                        type: "object",
                        default: null,
                      },
                      message: {
                        type: "string",
                      },
                      statusCode: {
                        type: "number",
                        default: 404,
                      },
                    },
                  },
                },
              },
            },
            "400": {
              description: "Bad Request",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        default: false,
                      },
                      data: {
                        type: "object",
                        default: null,
                      },
                      message: {
                        type: "string",
                      },
                      statusCode: {
                        type: "number",
                        default: 400,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },

      /** user route documentation**/
      "/user/": {
        post: {
          security: [
            {
              bearerAuth: [],
            },
          ],
          summary: "Create a new user",
          tags: ["User"],
          description: "Create a new user",
          requestBody: {
            content: {
              "multipart/form-data": {
                schema: {
                  type: "object",
                  properties: {
                    fname: {
                      type: "string",
                      description: "The user's first name",
                    },
                    lname: {
                      type: "string",
                      description: "The user's last name",
                    },
                    email: {
                      type: "string",
                      format: "email",
                      description: "The user's email address",
                    },
                    password: {
                      type: "string",
                      format: "password",
                      description: "The user's password",
                    },
                    phone: {
                      type: "number",
                      description: "The user's phone number",
                    },
                    image: {
                      type: "string",
                      format: "binary",
                      description: "The user's image",
                    },
                    familyBranch: {
                      type: "string",
                      enum: [
                        "branch_1",
                        "branch_2",
                        "branch_3",
                        "branch_4",
                        "branch_5",
                      ],
                      description: "The user's family branch",
                    },
                    familyRelationship: {
                      type: "string",
                      enum: [
                        "son",
                        "daughter",
                        "wife",
                        "husband",
                        "grandchild",
                        "other",
                      ],
                      description: "The user's family relationship",
                    },
                    role: {
                      type: "string",
                      description: "The user's role",
                      enum: ["super_admin", "admin", "moderator", "user"],
                    },
                  },
                  required: [
                    "email",
                    "password",
                    "fname",
                    "lname",
                    "phone",
                    "familyRelationship",
                    "familyBranch",
                  ],
                },
              },
            },
          },
          responses: {
            "201": {
              description: "user created successfully",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                      },
                      data: {
                        type: "object",
                      },
                      message: {
                        type: "string",
                      },
                    },
                  },
                },
              },
            },
            "401": {
              description: "Unauthorized",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        default: false,
                      },
                      data: {
                        type: "object",
                        default: null,
                      },
                      message: {
                        type: "string",
                      },
                      statusCode: {
                        type: "number",
                        default: 401,
                      },
                    },
                  },
                },
              },
            },
            "404": {
              description: "Not Found",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        default: false,
                      },
                      data: {
                        type: "object",
                        default: null,
                      },
                      message: {
                        type: "string",
                      },
                      statusCode: {
                        type: "number",
                        default: 404,
                      },
                    },
                  },
                },
              },
            },
            "400": {
              description: "Bad Request",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        default: false,
                      },
                      data: {
                        type: "object",
                        default: null,
                      },
                      message: {
                        type: "string",
                      },
                      statusCode: {
                        type: "number",
                        default: 400,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        get: {
          security: [
            {
              bearerAuth: [],
            },
          ],
          summary: "Get all users",
          tags: ["User"],
          description: "Get all users",
          parameters: [
            {
              name: "page",
              in: "query",
              required: false,
              schema: {
                type: "integer",
                default: 1,
                description: "The page number to retrieve",
              },
            },
            {
              name: "limit",
              in: "query",
              required: false,
              schema: {
                type: "integer",
                default: 10,
                description: "The number of users to retrieve per page",
              },
            },
          ],
          responses: {
            "200": {
              description: "Get all users successfuly",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                      },
                      data: {
                        type: "object",
                      },
                      message: {
                        type: "string",
                      },
                    },
                  },
                },
              },
            },
            "401": {
              description: "Unauthorized",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        default: false,
                      },
                      data: {
                        type: "object",
                        default: null,
                      },
                      message: {
                        type: "string",
                      },
                      statusCode: {
                        type: "number",
                        default: 401,
                      },
                    },
                  },
                },
              },
            },
            "404": {
              description: "Not Found",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        default: false,
                      },
                      data: {
                        type: "object",
                        default: null,
                      },
                      message: {
                        type: "string",
                      },
                      statusCode: {
                        type: "number",
                        default: 404,
                      },
                    },
                  },
                },
              },
            },
            "400": {
              description: "Bad Request",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        default: false,
                      },
                      data: {
                        type: "object",
                        default: null,
                      },
                      message: {
                        type: "string",
                      },
                      statusCode: {
                        type: "number",
                        default: 400,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      "/user/{id}": {
        delete: {
          summary: "Delete a user.",
          tags: ["User"],
          security: [
            {
              bearerAuth: [],
            },
          ],
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: {
                type: String,
              },
            },
          ],
          description: "Delete a user by id",
          responses: {
            "200": {
              description: "User deleted successfully",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                      },
                      data: {
                        type: null,
                      },
                      message: {
                        type: "string",
                      },
                    },
                  },
                },
              },
            },
            "404": {
              description: "Not Found",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        default: false,
                      },
                      data: {
                        type: "object",
                        default: null,
                      },
                      message: {
                        type: "string",
                      },
                      statusCode: {
                        type: "number",
                        default: 404,
                      },
                    },
                  },
                },
              },
            },
            "401": {
              description: "Unauthorized",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        default: false,
                      },
                      data: {
                        type: "object",
                        default: null,
                      },
                      message: {
                        type: "string",
                      },
                      statusCode: {
                        type: "number",
                        default: 401,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        get: {
          summary: "Get a user by id.",
          tags: ["User"],
          security: [
            {
              bearerAuth: [],
            },
          ],
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: {
                type: String,
              },
            },
          ],
          description: "Get a user by id",
          responses: {
            "200": {
              description: "Get user successfully",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                      },
                      data: {
                        type: "object",
                      },
                      message: {
                        type: "string",
                      },
                    },
                  },
                },
              },
            },
            "404": {
              description: "Not Found",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        default: false,
                      },
                      data: {
                        type: "object",
                        default: null,
                      },
                      message: {
                        type: "string",
                      },
                      statusCode: {
                        type: "number",
                        default: 404,
                      },
                    },
                  },
                },
              },
            },
            "401": {
              description: "Unauthorized",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        default: false,
                      },
                      data: {
                        type: "object",
                        default: null,
                      },
                      message: {
                        type: "string",
                      },
                      statusCode: {
                        type: "number",
                        default: 401,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        patch: {
          security: [
            {
              bearerAuth: [],
            },
          ],
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: {
                type: String,
              },
            },
          ],
          summary: "Update user",
          tags: ["User"],
          description: "Update user by id",
          requestBody: {
            content: {
              "multipart/form-data": {
                schema: {
                  type: "object",
                  properties: {
                    fname: {
                      type: "string",
                      description: "The user's first name",
                    },
                    lname: {
                      type: "string",
                      description: "The user's last name",
                    },
                    email: {
                      type: "string",
                      format: "email",
                      description: "The user's email address",
                    },
                    password: {
                      type: "string",
                      format: "password",
                      description: "The user's password",
                    },
                    phone: {
                      type: "number",
                      description: "The user's phone number",
                    },
                    image: {
                      type: "string",
                      format: "binary",
                      description: "The user's image",
                    },
                    familyBranch: {
                      type: "string",
                      enum: [
                        "branch_1",
                        "branch_2",
                        "branch_3",
                        "branch_4",
                        "branch_5",
                      ],
                      description: "The user's family branch",
                    },
                    familyRelationship: {
                      type: "string",
                      enum: [
                        "son",
                        "daughter",
                        "wife",
                        "husband",
                        "grandchild",
                        "other",
                      ],
                      description: "The user's family relationship",
                    },
                    role: {
                      type: "string",
                      description: "The user's role",
                      enum: ["super_admin", "admin", "moderator", "user"],
                    },
                    status: {
                      type: "string",
                      enum: ["pending", "reject", "accept"],
                      description: "The user's staus",
                    },
                    address: {
                      type: "string",
                      description: "The user's address",
                    },
                    birthday: {
                      type: "string",
                      format: "date",
                      description: "The user's birthday",
                    },
                    personalProfile: {
                      type: "string",
                      description: "The user's personal Profile",
                    },
                  },
                },
              },
            },
          },
          responses: {
            "200": {
              description: "user updated successfully",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                      },
                      data: {
                        type: "object",
                      },
                      message: {
                        type: "string",
                      },
                    },
                  },
                },
              },
            },
            "401": {
              description: "Unauthorized",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        default: false,
                      },
                      data: {
                        type: "object",
                        default: null,
                      },
                      message: {
                        type: "string",
                      },
                      statusCode: {
                        type: "number",
                        default: 401,
                      },
                    },
                  },
                },
              },
            },
            "404": {
              description: "Not Found",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        default: false,
                      },
                      data: {
                        type: "object",
                        default: null,
                      },
                      message: {
                        type: "string",
                      },
                      statusCode: {
                        type: "number",
                        default: 404,
                      },
                    },
                  },
                },
              },
            },
            "400": {
              description: "Bad Request",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        default: false,
                      },
                      data: {
                        type: "object",
                        default: null,
                      },
                      message: {
                        type: "string",
                      },
                      statusCode: {
                        type: "number",
                        default: 400,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      "/user/authUser": {
        post: {
          summary: "Get an auth user.",
          tags: ["User"],
          security: [
            {
              bearerAuth: [],
            },
          ],
          description: "Get authorized user",
          responses: {
            "200": {
              description: "Get authorized user successfully",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                      },
                      data: {
                        type: "object",
                      },
                      message: {
                        type: "string",
                      },
                    },
                  },
                },
              },
            },
            "401": {
              description: "Unauthorized",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        default: false,
                      },
                      data: {
                        type: "object",
                        default: null,
                      },
                      message: {
                        type: "string",
                      },
                      statusCode: {
                        type: "number",
                        default: 401,
                      },
                    },
                  },
                },
              },
            },
            "404": {
              description: "Not Found",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        default: false,
                      },
                      data: {
                        type: "object",
                        default: null,
                      },
                      message: {
                        type: "string",
                      },
                      statusCode: {
                        type: "number",
                        default: 404,
                      },
                    },
                  },
                },
              },
            },
            "400": {
              description: "Bad Request",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        default: false,
                      },
                      data: {
                        type: "object",
                        default: null,
                      },
                      message: {
                        type: "string",
                      },
                      statusCode: {
                        type: "number",
                        default: 400,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      "/user/{id}/permissions": {
        patch: {
          summary: "Update permissions for user.",
          tags: ["User"],
          security: [
            {
              bearerAuth: [],
            },
          ],
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: {
                type: String,
              },
            },
          ],
          description: "Update permissions for user by id.",
          requestBody: {
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    permissions: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          entity: {
                            type: "string",
                          },
                          view: {
                            type: "string",
                          },
                          update: {
                            type: "string",
                          },
                          delete: {
                            type: "string",
                          },
                          create: {
                            type: "string",
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          responses: {
            "200": {
              description: "Update user permissions successfully",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                      },
                      data: {
                        type: "object",
                      },
                      message: {
                        type: "string",
                      },
                    },
                  },
                },
              },
            },
            "401": {
              description: "Unauthorized",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        default: false,
                      },
                      data: {
                        type: "object",
                        default: null,
                      },
                      message: {
                        type: "string",
                      },
                      statusCode: {
                        type: "number",
                        default: 401,
                      },
                    },
                  },
                },
              },
            },
            "404": {
              description: "Not Found",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        default: false,
                      },
                      data: {
                        type: "object",
                        default: null,
                      },
                      message: {
                        type: "string",
                      },
                      statusCode: {
                        type: "number",
                        default: 404,
                      },
                    },
                  },
                },
              },
            },
            "400": {
              description: "Bad Request",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        default: false,
                      },
                      data: {
                        type: "object",
                        default: null,
                      },
                      message: {
                        type: "string",
                      },
                      statusCode: {
                        type: "number",
                        default: 400,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },

      /** album route documentation**/
      "/album/": {
        post: {
          security: [
            {
              bearerAuth: [],
            },
          ],
          summary: "Create a new album",
          tags: ["Album"],
          description: "Create a new album",
          requestBody: {
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    name: {
                      type: "string",
                      description: "The album's name",
                    },
                    description: {
                      type: "string",
                      description: "The album's description",
                    },
                  },
                  required: ["name"],
                },
              },
            },
          },
          responses: {
            "201": {
              description: "Album created successfully",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                      },
                      data: {
                        type: "object",
                      },
                      message: {
                        type: "string",
                      },
                    },
                  },
                },
              },
            },
            "401": {
              description: "Unauthorized",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        default: false,
                      },
                      data: {
                        type: "object",
                        default: null,
                      },
                      message: {
                        type: "string",
                      },
                      statusCode: {
                        type: "number",
                        default: 401,
                      },
                    },
                  },
                },
              },
            },
            "404": {
              description: "Not Found",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        default: false,
                      },
                      data: {
                        type: "object",
                        default: null,
                      },
                      message: {
                        type: "string",
                      },
                      statusCode: {
                        type: "number",
                        default: 404,
                      },
                    },
                  },
                },
              },
            },
            "400": {
              description: "Bad Request",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        default: false,
                      },
                      data: {
                        type: "object",
                        default: null,
                      },
                      message: {
                        type: "string",
                      },
                      statusCode: {
                        type: "number",
                        default: 400,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        get: {
          security: [
            {
              bearerAuth: [],
            },
          ],
          summary: "Get all albums",
          tags: ["Album"],
          description: "Get all albums",
          parameters: [
            {
              name: "page",
              in: "query",
              required: false,
              schema: {
                type: "integer",
                default: 1,
                description: "The page number to retrieve",
              },
            },
            {
              name: "limit",
              in: "query",
              required: false,
              schema: {
                type: "integer",
                default: 10,
                description: "The number of albums to retrieve per page",
              },
            },
          ],
          responses: {
            "200": {
              description: "Get all albums successfuly",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                      },
                      data: {
                        type: "object",
                      },
                      message: {
                        type: "string",
                      },
                    },
                  },
                },
              },
            },
            "401": {
              description: "Unauthorized",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        default: false,
                      },
                      data: {
                        type: "object",
                        default: null,
                      },
                      message: {
                        type: "string",
                      },
                      statusCode: {
                        type: "number",
                        default: 401,
                      },
                    },
                  },
                },
              },
            },
            "404": {
              description: "Not Found",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        default: false,
                      },
                      data: {
                        type: "object",
                        default: null,
                      },
                      message: {
                        type: "string",
                      },
                      statusCode: {
                        type: "number",
                        default: 404,
                      },
                    },
                  },
                },
              },
            },
            "400": {
              description: "Bad Request",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        default: false,
                      },
                      data: {
                        type: "object",
                        default: null,
                      },
                      message: {
                        type: "string",
                      },
                      statusCode: {
                        type: "number",
                        default: 400,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      "/album/{id}": {
        delete: {
          summary: "Delete an album.",
          tags: ["Album"],
          security: [
            {
              bearerAuth: [],
            },
          ],
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: {
                type: String,
              },
            },
          ],
          description: "Delete an album by id",
          responses: {
            "200": {
              description: "Album deleted successfully",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                      },
                      data: {
                        type: null,
                      },
                      message: {
                        type: "string",
                      },
                    },
                  },
                },
              },
            },
            "404": {
              description: "Not Found",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        default: false,
                      },
                      data: {
                        type: "object",
                        default: null,
                      },
                      message: {
                        type: "string",
                      },
                      statusCode: {
                        type: "number",
                        default: 404,
                      },
                    },
                  },
                },
              },
            },
            "401": {
              description: "Unauthorized",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        default: false,
                      },
                      data: {
                        type: "object",
                        default: null,
                      },
                      message: {
                        type: "string",
                      },
                      statusCode: {
                        type: "number",
                        default: 401,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        get: {
          summary: "Get an album by id.",
          tags: ["Album"],
          security: [
            {
              bearerAuth: [],
            },
          ],
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: {
                type: String,
              },
            },
          ],
          description: "Get an album by id",
          responses: {
            "200": {
              description: "Get an album successfully",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                      },
                      data: {
                        type: "object",
                      },
                      message: {
                        type: "string",
                      },
                    },
                  },
                },
              },
            },
            "404": {
              description: "Not Found",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        default: false,
                      },
                      data: {
                        type: "object",
                        default: null,
                      },
                      message: {
                        type: "string",
                      },
                      statusCode: {
                        type: "number",
                        default: 404,
                      },
                    },
                  },
                },
              },
            },
            "401": {
              description: "Unauthorized",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        default: false,
                      },
                      data: {
                        type: "object",
                        default: null,
                      },
                      message: {
                        type: "string",
                      },
                      statusCode: {
                        type: "number",
                        default: 401,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        put: {
          security: [
            {
              bearerAuth: [],
            },
          ],
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: {
                type: String,
              },
            },
          ],
          summary: "Update an album by adding image",
          tags: ["Album"],
          description: "Update an album by id to add an image",
          requestBody: {
            content: {
              "multipart/form-data": {
                schema: {
                  type: "object",
                  properties: {
                    image: {
                      type: "string",
                      format: "binary",
                      description: "The image that will be added to the album",
                    },
                    description: {
                      type: "strig",
                      description: "The image's description",
                    },
                  },
                  required: ["image"],
                },
              },
            },
          },
          responses: {
            "200": {
              description: "Album updated successfully",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                      },
                      data: {
                        type: "object",
                      },
                      message: {
                        type: "string",
                      },
                    },
                  },
                },
              },
            },
            "401": {
              description: "Unauthorized",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        default: false,
                      },
                      data: {
                        type: "object",
                        default: null,
                      },
                      message: {
                        type: "string",
                      },
                      statusCode: {
                        type: "number",
                        default: 401,
                      },
                    },
                  },
                },
              },
            },
            "404": {
              description: "Not Found",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        default: false,
                      },
                      data: {
                        type: "object",
                        default: null,
                      },
                      message: {
                        type: "string",
                      },
                      statusCode: {
                        type: "number",
                        default: 404,
                      },
                    },
                  },
                },
              },
            },
            "400": {
              description: "Bad Request",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        default: false,
                      },
                      data: {
                        type: "object",
                        default: null,
                      },
                      message: {
                        type: "string",
                      },
                      statusCode: {
                        type: "number",
                        default: 400,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        patch: {
          security: [
            {
              bearerAuth: [],
            },
          ],
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: {
                type: String,
              },
            },
          ],
          summary: "Update an album",
          tags: ["Album"],
          description: "Update an album",
          requestBody: {
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    name: {
                      type: "string",
                      description: "The image's name",
                    },
                    description: {
                      type: "strig",
                      description: "The image's description",
                    },
                  },
                },
              },
            },
          },
          responses: {
            "200": {
              description: "Album updated successfully",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                      },
                      data: {
                        type: "object",
                      },
                      message: {
                        type: "string",
                      },
                    },
                  },
                },
              },
            },
            "401": {
              description: "Unauthorized",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        default: false,
                      },
                      data: {
                        type: "object",
                        default: null,
                      },
                      message: {
                        type: "string",
                      },
                      statusCode: {
                        type: "number",
                        default: 401,
                      },
                    },
                  },
                },
              },
            },
            "404": {
              description: "Not Found",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        default: false,
                      },
                      data: {
                        type: "object",
                        default: null,
                      },
                      message: {
                        type: "string",
                      },
                      statusCode: {
                        type: "number",
                        default: 404,
                      },
                    },
                  },
                },
              },
            },
            "400": {
              description: "Bad Request",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        default: false,
                      },
                      data: {
                        type: "object",
                        default: null,
                      },
                      message: {
                        type: "string",
                      },
                      statusCode: {
                        type: "number",
                        default: 400,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      "/album/{id}/images/{imageId}": {
        delete: {
          summary: "Delete an image from an album.",
          tags: ["Album"],
          security: [
            {
              bearerAuth: [],
            },
          ],
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: {
                type: String,
              },
              description: "The ID of the album",
            },
            {
              in: "path",
              name: "imageId",
              required: true,
              schema: {
                type: String,
              },
              description: "The ID of the image to delete"
            },
          ],
          description: "Delete an image from an album by id",
          responses: {
            "200": {
              description: "Image deleted from an album successfully",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                      },
                      data: {
                        type: null,
                      },
                      message: {
                        type: "string",
                      },
                    },
                  },
                },
              },
            },
            "404": {
              description: "Not Found",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        default: false,
                      },
                      data: {
                        type: "object",
                        default: null,
                      },
                      message: {
                        type: "string",
                      },
                      statusCode: {
                        type: "number",
                        default: 404,
                      },
                    },
                  },
                },
              },
            },
            "401": {
              description: "Unauthorized",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        default: false,
                      },
                      data: {
                        type: "object",
                        default: null,
                      },
                      message: {
                        type: "string",
                      },
                      statusCode: {
                        type: "number",
                        default: 401,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },

      /** financial route documentation**/
      "/financial/": {
        post: {
          security: [
            {
              bearerAuth: [],
            },
          ],
          summary: "Create a new transaction",
          tags: ["Financial"],
          description: "Create a new transaction",
          requestBody: {
            content: {
              "multipart/form-data": {
                schema: {
                  type: "object",
                  properties: {
                    name: {
                      type: "string",
                      description: "The transaction's name",
                    },
                    amount: {
                      type: "number",
                      description: "The transaction's amount",
                    },
                    type: {
                      type: "string",
                      enum: ["income", "expense"],
                      description: "The transaction's type",
                    },
                    date: {
                      type: "date",
                      description: "The transaction's date",
                    },
                    category: {
                      type: "string",
                      enum: [
                        "subscriptions",
                        "donations",
                        "investments",
                        "other",
                      ],
                      description: "The transaction's category",
                    },
                    description: {
                      type: "string",
                      description: "The transaction's description",
                    },
                    image: {
                      type: "string",
                      format: "binary",
                      description: "The transaction's image",
                    },
                    status: {
                      type: "string",
                      enum: ["pending", "reject", "accept"],
                      description: "The transaction's status",
                    },
                  },
                  required: ["name", "amount", "type", "date", "category"],
                },
              },
            },
          },
          responses: {
            "201": {
              description: "Transaction created successfully",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                      },
                      data: {
                        type: "object",
                      },
                      message: {
                        type: "string",
                      },
                    },
                  },
                },
              },
            },
            "401": {
              description: "Unauthorized",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        default: false,
                      },
                      data: {
                        type: "object",
                        default: null,
                      },
                      message: {
                        type: "string",
                      },
                      statusCode: {
                        type: "number",
                        default: 401,
                      },
                    },
                  },
                },
              },
            },
            "404": {
              description: "Not Found",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        default: false,
                      },
                      data: {
                        type: "object",
                        default: null,
                      },
                      message: {
                        type: "string",
                      },
                      statusCode: {
                        type: "number",
                        default: 404,
                      },
                    },
                  },
                },
              },
            },
            "400": {
              description: "Bad Request",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        default: false,
                      },
                      data: {
                        type: "object",
                        default: null,
                      },
                      message: {
                        type: "string",
                      },
                      statusCode: {
                        type: "number",
                        default: 400,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        get: {
          security: [
            {
              bearerAuth: [],
            },
          ],
          summary: "Get all transactions",
          tags: ["Financial"],
          description: "Get all transactions",
          parameters: [
            {
              name: "page",
              in: "query",
              required: false,
              schema: {
                type: "integer",
                default: 1,
                description: "The page number to retrieve",
              },
            },
            {
              name: "limit",
              in: "query",
              required: false,
              schema: {
                type: "integer",
                default: 10,
                description: "The number of transactions to retrieve per page",
              },
            },
          ],
          responses: {
            "200": {
              description: "Get all transactions successfuly",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                      },
                      data: {
                        type: "object",
                      },
                      message: {
                        type: "string",
                      },
                    },
                  },
                },
              },
            },
            "401": {
              description: "Unauthorized",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        default: false,
                      },
                      data: {
                        type: "object",
                        default: null,
                      },
                      message: {
                        type: "string",
                      },
                      statusCode: {
                        type: "number",
                        default: 401,
                      },
                    },
                  },
                },
              },
            },
            "404": {
              description: "Not Found",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        default: false,
                      },
                      data: {
                        type: "object",
                        default: null,
                      },
                      message: {
                        type: "string",
                      },
                      statusCode: {
                        type: "number",
                        default: 404,
                      },
                    },
                  },
                },
              },
            },
            "400": {
              description: "Bad Request",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        default: false,
                      },
                      data: {
                        type: "object",
                        default: null,
                      },
                      message: {
                        type: "string",
                      },
                      statusCode: {
                        type: "number",
                        default: 400,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        delete: {
          summary: "Delete  all transactions",
          tags: ["Financial"],
          security: [
            {
              bearerAuth: [],
            },
          ],
          description: "Delete all transactions",
          requestBody: {
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    confirm: {
                      type: "boolean",
                    },
                  },
                  required: ["confirm"],
                },
              },
            },
          },
          responses: {
            "200": {
              description: "ALll transactions deleted successfully",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                      },
                      data: {
                        type: null,
                      },
                      message: {
                        type: "string",
                      },
                    },
                  },
                },
              },
            },
            "404": {
              description: "Not Found",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        default: false,
                      },
                      data: {
                        type: "object",
                        default: null,
                      },
                      message: {
                        type: "string",
                      },
                      statusCode: {
                        type: "number",
                        default: 404,
                      },
                    },
                  },
                },
              },
            },
            "401": {
              description: "Unauthorized",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        default: false,
                      },
                      data: {
                        type: "object",
                        default: null,
                      },
                      message: {
                        type: "string",
                      },
                      statusCode: {
                        type: "number",
                        default: 401,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      "/financial/{id}": {
        delete: {
          summary: "Delete a transaction.",
          tags: ["Financial"],
          security: [
            {
              bearerAuth: [],
            },
          ],
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: {
                type: String,
              },
            },
          ],
          description: "Delete a transaction by id",
          responses: {
            "200": {
              description: "Transaction deleted successfully",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                      },
                      data: {
                        type: null,
                      },
                      message: {
                        type: "string",
                      },
                    },
                  },
                },
              },
            },
            "404": {
              description: "Not Found",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        default: false,
                      },
                      data: {
                        type: "object",
                        default: null,
                      },
                      message: {
                        type: "string",
                      },
                      statusCode: {
                        type: "number",
                        default: 404,
                      },
                    },
                  },
                },
              },
            },
            "401": {
              description: "Unauthorized",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        default: false,
                      },
                      data: {
                        type: "object",
                        default: null,
                      },
                      message: {
                        type: "string",
                      },
                      statusCode: {
                        type: "number",
                        default: 401,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        get: {
          summary: "Get a transaction.",
          tags: ["Financial"],
          security: [
            {
              bearerAuth: [],
            },
          ],
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: {
                type: String,
              },
            },
          ],
          description: "Get a transaction by id",
          responses: {
            "200": {
              description: "Get a transaction successfully",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                      },
                      data: {
                        type: "object",
                      },
                      message: {
                        type: "string",
                      },
                    },
                  },
                },
              },
            },
            "404": {
              description: "Not Found",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        default: false,
                      },
                      data: {
                        type: "object",
                        default: null,
                      },
                      message: {
                        type: "string",
                      },
                      statusCode: {
                        type: "number",
                        default: 404,
                      },
                    },
                  },
                },
              },
            },
            "401": {
              description: "Unauthorized",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        default: false,
                      },
                      data: {
                        type: "object",
                        default: null,
                      },
                      message: {
                        type: "string",
                      },
                      statusCode: {
                        type: "number",
                        default: 401,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        patch: {
          security: [
            {
              bearerAuth: [],
            },
          ],
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: {
                type: String,
              },
            },
          ],
          summary: "Update a transaction",
          tags: ["Financial"],
          description: "Update a transaction by id ",
          requestBody: {
            content: {
              "multipart/form-data": {
                schema: {
                  type: "object",
                  properties: {
                    name: {
                      type: "string",
                      description: "The transaction's name",
                    },
                    amount: {
                      type: "number",
                      description: "The transaction's amount",
                    },
                    type: {
                      type: "string",
                      enum: ["income", "expense"],
                      description: "The transaction's type",
                    },
                    date: {
                      type: "date",
                      description: "The transaction's date",
                    },
                    category: {
                      type: "string",
                      enum: [
                        "subscriptions",
                        "donations",
                        "investments",
                        "other",
                      ],
                      description: "The transaction's category",
                    },
                    description: {
                      type: "string",
                      description: "The transaction's description",
                    },
                    image: {
                      type: "string",
                      format: "binary",
                      description: "TThe transaction's image",
                    },
                  },
                },
              },
            },
          },
          responses: {
            "200": {
              description: "Transaction updated successfully",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                      },
                      data: {
                        type: "object",
                      },
                      message: {
                        type: "string",
                      },
                    },
                  },
                },
              },
            },
            "401": {
              description: "Unauthorized",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        default: false,
                      },
                      data: {
                        type: "object",
                        default: null,
                      },
                      message: {
                        type: "string",
                      },
                      statusCode: {
                        type: "number",
                        default: 401,
                      },
                    },
                  },
                },
              },
            },
            "404": {
              description: "Not Found",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        default: false,
                      },
                      data: {
                        type: "object",
                        default: null,
                      },
                      message: {
                        type: "string",
                      },
                      statusCode: {
                        type: "number",
                        default: 404,
                      },
                    },
                  },
                },
              },
            },
            "400": {
              description: "Bad Request",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        default: false,
                      },
                      data: {
                        type: "object",
                        default: null,
                      },
                      message: {
                        type: "string",
                      },
                      statusCode: {
                        type: "number",
                        default: 400,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },

      /** event route documentation**/
      "/event/": {
        post: {
          security: [
            {
              bearerAuth: [],
            },
          ],
          summary: "Create a new event",
          tags: ["Event"],
          description: "Create a new event",
          requestBody: {
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    address: {
                      type: "string",
                      description: "The event's address",
                    },
                    description: {
                      type: "number",
                      description: "The event's description",
                    },
                    location: {
                      type: "string",
                      description: "The event's location",
                    },
                    startDate: {
                      type: "date",
                      description: "The event's startDate",
                    },
                    endDate: {
                      type: "date",
                      description: "The event's endDate",
                    },
                    status: {
                      type: "string",
                      enum: ["pending", "reject", "accept"],
                      default: "pending",
                      description: "The event's status",
                    },
                  },
                  required: ["address", "description", "location", "startDate"],
                },
              },
            },
          },
          responses: {
            "201": {
              description: "Event created successfully",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                      },
                      data: {
                        type: "object",
                      },
                      message: {
                        type: "string",
                      },
                    },
                  },
                },
              },
            },
            "401": {
              description: "Unauthorized",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        default: false,
                      },
                      data: {
                        type: "object",
                        default: null,
                      },
                      message: {
                        type: "string",
                      },
                      statusCode: {
                        type: "number",
                        default: 401,
                      },
                    },
                  },
                },
              },
            },
            "404": {
              description: "Not Found",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        default: false,
                      },
                      data: {
                        type: "object",
                        default: null,
                      },
                      message: {
                        type: "string",
                      },
                      statusCode: {
                        type: "number",
                        default: 404,
                      },
                    },
                  },
                },
              },
            },
            "400": {
              description: "Bad Request",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        default: false,
                      },
                      data: {
                        type: "object",
                        default: null,
                      },
                      message: {
                        type: "string",
                      },
                      statusCode: {
                        type: "number",
                        default: 400,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        get: {
          security: [
            {
              bearerAuth: [],
            },
          ],
          summary: "Get all events",
          tags: ["Event"],
          description: "Get all events",
          parameters: [
            {
              name: "page",
              in: "query",
              required: false,
              schema: {
                type: "integer",
                default: 1,
                description: "The page number to retrieve",
              },
            },
            {
              name: "limit",
              in: "query",
              required: false,
              schema: {
                type: "integer",
                default: 10,
                description: "The number of events to retrieve per page",
              },
            },
          ],
          responses: {
            "200": {
              description: "Get all events successfuly",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                      },
                      data: {
                        type: "object",
                      },
                      message: {
                        type: "string",
                      },
                    },
                  },
                },
              },
            },
            "401": {
              description: "Unauthorized",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        default: false,
                      },
                      data: {
                        type: "object",
                        default: null,
                      },
                      message: {
                        type: "string",
                      },
                      statusCode: {
                        type: "number",
                        default: 401,
                      },
                    },
                  },
                },
              },
            },
            "404": {
              description: "Not Found",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        default: false,
                      },
                      data: {
                        type: "object",
                        default: null,
                      },
                      message: {
                        type: "string",
                      },
                      statusCode: {
                        type: "number",
                        default: 404,
                      },
                    },
                  },
                },
              },
            },
            "400": {
              description: "Bad Request",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        default: false,
                      },
                      data: {
                        type: "object",
                        default: null,
                      },
                      message: {
                        type: "string",
                      },
                      statusCode: {
                        type: "number",
                        default: 400,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      "/event/{id}": {
        delete: {
          summary: "Delete an event.",
          tags: ["Event"],
          security: [
            {
              bearerAuth: [],
            },
          ],
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: {
                type: String,
              },
            },
          ],
          description: "Delete an event by id",
          responses: {
            "200": {
              description: "Event deleted successfully",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                      },
                      data: {
                        type: null,
                      },
                      message: {
                        type: "string",
                      },
                    },
                  },
                },
              },
            },
            "404": {
              description: "Not Found",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        default: false,
                      },
                      data: {
                        type: "object",
                        default: null,
                      },
                      message: {
                        type: "string",
                      },
                      statusCode: {
                        type: "number",
                        default: 404,
                      },
                    },
                  },
                },
              },
            },
            "401": {
              description: "Unauthorized",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        default: false,
                      },
                      data: {
                        type: "object",
                        default: null,
                      },
                      message: {
                        type: "string",
                      },
                      statusCode: {
                        type: "number",
                        default: 401,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        get: {
          summary: "Get an event.",
          tags: ["Event"],
          security: [
            {
              bearerAuth: [],
            },
          ],
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: {
                type: String,
              },
            },
          ],
          description: "Get an event by id",
          responses: {
            "200": {
              description: "Get an event successfully",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                      },
                      data: {
                        type: "object",
                      },
                      message: {
                        type: "string",
                      },
                    },
                  },
                },
              },
            },
            "404": {
              description: "Not Found",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        default: false,
                      },
                      data: {
                        type: "object",
                        default: null,
                      },
                      message: {
                        type: "string",
                      },
                      statusCode: {
                        type: "number",
                        default: 404,
                      },
                    },
                  },
                },
              },
            },
            "401": {
              description: "Unauthorized",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        default: false,
                      },
                      data: {
                        type: "object",
                        default: null,
                      },
                      message: {
                        type: "string",
                      },
                      statusCode: {
                        type: "number",
                        default: 401,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        patch: {
          security: [
            {
              bearerAuth: [],
            },
          ],
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: {
                type: String,
              },
            },
          ],
          summary: "Update an event",
          tags: ["Event"],
          description: "Update an event by id ",
          requestBody: {
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    address: {
                      type: "string",
                      description: "The event's address",
                    },
                    description: {
                      type: "number",
                      description: "The event's description",
                    },
                    location: {
                      type: "string",
                      description: "The event's location",
                    },
                    startDate: {
                      type: "date",
                      description: "The event's startDate",
                    },
                    endDate: {
                      type: "date",
                      description: "The event's endDate",
                    },
                    status: {
                      type: "string",
                      enum: ["pending", "reject", "accept"],
                      description: "The event's status",
                    },
                  },
                },
              },
            },
          },
          responses: {
            "200": {
              description: "Event updated successfully",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                      },
                      data: {
                        type: "object",
                      },
                      message: {
                        type: "string",
                      },
                    },
                  },
                },
              },
            },
            "401": {
              description: "Unauthorized",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        default: false,
                      },
                      data: {
                        type: "object",
                        default: null,
                      },
                      message: {
                        type: "string",
                      },
                      statusCode: {
                        type: "number",
                        default: 401,
                      },
                    },
                  },
                },
              },
            },
            "404": {
              description: "Not Found",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        default: false,
                      },
                      data: {
                        type: "object",
                        default: null,
                      },
                      message: {
                        type: "string",
                      },
                      statusCode: {
                        type: "number",
                        default: 404,
                      },
                    },
                  },
                },
              },
            },
            "400": {
              description: "Bad Request",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        default: false,
                      },
                      data: {
                        type: "object",
                        default: null,
                      },
                      message: {
                        type: "string",
                      },
                      statusCode: {
                        type: "number",
                        default: 400,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },

      /** advertisement route documentation**/
      "/advertisement/": {
        post: {
          security: [
            {
              bearerAuth: [],
            },
          ],
          summary: "Create a new advertisement",
          tags: ["Advertisement"],
          description: "Create a new advertisement",
          requestBody: {
            content: {
              "multipart/form-data": {
                schema: {
                  type: "object",
                  properties: {
                    title: {
                      type: "string",
                      description: "The advertisement's title",
                    },
                    type: {
                      type: "string",
                      enum: ["important", "general", "social"],
                      description: "The advertisement's type",
                    },
                    content: {
                      type: "string",
                      description: "The advertisement's content",
                    },
                    image: {
                      type: "string",
                      format: "binary",
                      description: "The advertisement's image",
                    },
                    status: {
                      type: "string",
                      enum: ["pending", "reject", "accept"],
                      description: "The advertisement's status",
                    },
                  },
                  required: ["title", "content", "type"],
                },
              },
            },
          },
          responses: {
            "201": {
              description: "Advertisement created successfully",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                      },
                      data: {
                        type: "object",
                      },
                      message: {
                        type: "string",
                      },
                    },
                  },
                },
              },
            },
            "401": {
              description: "Unauthorized",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        default: false,
                      },
                      data: {
                        type: "object",
                        default: null,
                      },
                      message: {
                        type: "string",
                      },
                      statusCode: {
                        type: "number",
                        default: 401,
                      },
                    },
                  },
                },
              },
            },
            "404": {
              description: "Not Found",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        default: false,
                      },
                      data: {
                        type: "object",
                        default: null,
                      },
                      message: {
                        type: "string",
                      },
                      statusCode: {
                        type: "number",
                        default: 404,
                      },
                    },
                  },
                },
              },
            },
            "400": {
              description: "Bad Request",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        default: false,
                      },
                      data: {
                        type: "object",
                        default: null,
                      },
                      message: {
                        type: "string",
                      },
                      statusCode: {
                        type: "number",
                        default: 400,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        get: {
          security: [
            {
              bearerAuth: [],
            },
          ],
          summary: "Get all advertisements",
          tags: ["Advertisement"],
          description: "Get all advertisements",
          parameters: [
            {
              name: "page",
              in: "query",
              required: false,
              schema: {
                type: "integer",
                default: 1,
                description: "The page number to retrieve",
              },
            },
            {
              name: "limit",
              in: "query",
              required: false,
              schema: {
                type: "integer",
                default: 10,
                description: "The number of advertisement to retrieve per page",
              },
            },
          ],
          responses: {
            "200": {
              description: "Get all advertisements successfuly",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                      },
                      data: {
                        type: "object",
                      },
                      message: {
                        type: "string",
                      },
                    },
                  },
                },
              },
            },
            "401": {
              description: "Unauthorized",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        default: false,
                      },
                      data: {
                        type: "object",
                        default: null,
                      },
                      message: {
                        type: "string",
                      },
                      statusCode: {
                        type: "number",
                        default: 401,
                      },
                    },
                  },
                },
              },
            },
            "404": {
              description: "Not Found",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        default: false,
                      },
                      data: {
                        type: "object",
                        default: null,
                      },
                      message: {
                        type: "string",
                      },
                      statusCode: {
                        type: "number",
                        default: 404,
                      },
                    },
                  },
                },
              },
            },
            "400": {
              description: "Bad Request",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        default: false,
                      },
                      data: {
                        type: "object",
                        default: null,
                      },
                      message: {
                        type: "string",
                      },
                      statusCode: {
                        type: "number",
                        default: 400,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        delete: {
          summary: "Delete  all advertisements",
          tags: ["Advertisement"],
          security: [
            {
              bearerAuth: [],
            },
          ],
          description: "Delete all advertisements",
          requestBody: {
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    confirm: {
                      type: "boolean",
                    },
                  },
                  required: ["confirm"],
                },
              },
            },
          },
          responses: {
            "200": {
              description: "ALll advertisements deleted successfully",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                      },
                      data: {
                        type: null,
                      },
                      message: {
                        type: "string",
                      },
                    },
                  },
                },
              },
            },
            "404": {
              description: "Not Found",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        default: false,
                      },
                      data: {
                        type: "object",
                        default: null,
                      },
                      message: {
                        type: "string",
                      },
                      statusCode: {
                        type: "number",
                        default: 404,
                      },
                    },
                  },
                },
              },
            },
            "401": {
              description: "Unauthorized",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        default: false,
                      },
                      data: {
                        type: "object",
                        default: null,
                      },
                      message: {
                        type: "string",
                      },
                      statusCode: {
                        type: "number",
                        default: 401,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      "/advertisement/{id}": {
        delete: {
          summary: "Delete an advertisement.",
          tags: ["Advertisement"],
          security: [
            {
              bearerAuth: [],
            },
          ],
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: {
                type: String,
              },
            },
          ],
          description: "Delete an advertisement by id",
          responses: {
            "200": {
              description: "Advertisement deleted successfully",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                      },
                      data: {
                        type: null,
                      },
                      message: {
                        type: "string",
                      },
                    },
                  },
                },
              },
            },
            "404": {
              description: "Not Found",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        default: false,
                      },
                      data: {
                        type: "object",
                        default: null,
                      },
                      message: {
                        type: "string",
                      },
                      statusCode: {
                        type: "number",
                        default: 404,
                      },
                    },
                  },
                },
              },
            },
            "401": {
              description: "Unauthorized",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        default: false,
                      },
                      data: {
                        type: "object",
                        default: null,
                      },
                      message: {
                        type: "string",
                      },
                      statusCode: {
                        type: "number",
                        default: 401,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        get: {
          summary: "Get an advertisement.",
          tags: ["Advertisement"],
          security: [
            {
              bearerAuth: [],
            },
          ],
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: {
                type: String,
              },
            },
          ],
          description: "Get an advertisement by id",
          responses: {
            "200": {
              description: "Get an advertisement successfully",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                      },
                      data: {
                        type: "object",
                      },
                      message: {
                        type: "string",
                      },
                    },
                  },
                },
              },
            },
            "404": {
              description: "Not Found",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        default: false,
                      },
                      data: {
                        type: "object",
                        default: null,
                      },
                      message: {
                        type: "string",
                      },
                      statusCode: {
                        type: "number",
                        default: 404,
                      },
                    },
                  },
                },
              },
            },
            "401": {
              description: "Unauthorized",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        default: false,
                      },
                      data: {
                        type: "object",
                        default: null,
                      },
                      message: {
                        type: "string",
                      },
                      statusCode: {
                        type: "number",
                        default: 401,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        patch: {
          security: [
            {
              bearerAuth: [],
            },
          ],
          parameters: [
            {
              in: "path",
              name: "id",
              required: true,
              schema: {
                type: String,
              },
            },
          ],
          summary: "Update an advertisement",
          tags: ["Advertisement"],
          description: "Update an advertisement by id ",
          requestBody: {
            content: {
              "multipart/form-data": {
                schema: {
                  type: "object",
                  properties: {
                    title: {
                      type: "string",
                      description: "The advertisement's title",
                    },
                    type: {
                      type: "string",
                      enum: ["important", "general", "social"],
                      description: "The advertisement's type",
                    },
                    content: {
                      type: "string",
                      description: "The advertisement's content",
                    },
                    image: {
                      type: "string",
                      format: "binary",
                      description: "The advertisement's image",
                    },
                    status: {
                      type: "string",
                      enum: ["pending", "reject", "accept"],
                      description: "The advertisement's status",
                    },
                  },
                },
              },
            },
          },
          responses: {
            "200": {
              description: "Transaction updated successfully",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                      },
                      data: {
                        type: "object",
                      },
                      message: {
                        type: "string",
                      },
                    },
                  },
                },
              },
            },
            "401": {
              description: "Unauthorized",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        default: false,
                      },
                      data: {
                        type: "object",
                        default: null,
                      },
                      message: {
                        type: "string",
                      },
                      statusCode: {
                        type: "number",
                        default: 401,
                      },
                    },
                  },
                },
              },
            },
            "404": {
              description: "Not Found",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        default: false,
                      },
                      data: {
                        type: "object",
                        default: null,
                      },
                      message: {
                        type: "string",
                      },
                      statusCode: {
                        type: "number",
                        default: 404,
                      },
                    },
                  },
                },
              },
            },
            "400": {
              description: "Bad Request",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: {
                        type: "boolean",
                        default: false,
                      },
                      data: {
                        type: "object",
                        default: null,
                      },
                      message: {
                        type: "string",
                      },
                      statusCode: {
                        type: "number",
                        default: 400,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  apis: ["../routes/*.ts", "../models/*.ts"],
};

const swaggerDocument = swaggerJsdoc(options);
export default swaggerDocument;
