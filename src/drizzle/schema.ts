import { relations } from "drizzle-orm";
import { integer, pgEnum, pgTable, uuid, varchar, primaryKey,
uniqueIndex, boolean, real, timestamp} from "drizzle-orm/pg-core";

export const UserRole = pgEnum("UserRole", ["ADMIN", "BASIC"]);

export const UserTable = pgTable("user", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 255 }).notNull(),
    age: integer("age").notNull(),

    // -- sometimes you need to restrict values on a column --
    // age: integer("age").notNull().$type<12 | 24>(),
    // -- Now the age must either be 12 or 24 only ---
    
    email: varchar("email", { length: 255 }).notNull().unique(),
    role: UserRole("userRole").default("BASIC").notNull()
}, table => {
        return {
            emailIndex: uniqueIndex("emailindex").on(table.email),
            // If we were to create a multi-column index, then this is how we 
            // would do it.
            // uniqueNameAndAge: uniqueIndex("uniqueNameAndAge").on(table.name, table.age),
        }
    }
);

// 1 : 1 relationship
export const UserPreferencesTable = pgTable("userPreferences", {
    id: uuid("id").primaryKey().defaultRandom(),
    emailUpdates: boolean("emailUpdates").notNull().default(false),
// Setting up a foreign key relationship
    userId: uuid("userId").references(() => UserTable.id).notNull(),

});

// 1 : m relationship
export const PostTable = pgTable("post", {
    id: uuid("id").primaryKey().defaultRandom(),
    title: varchar("title", { length: 255 }).notNull(),
    averageRating: real("averageRating").notNull().default(0),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().notNull(),
    authorId: uuid("authorId").references(() => UserTable.id).notNull(),
})

export const CategoryTable = pgTable("category", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 255 }).notNull(),
});

export const PostCategoryTable = pgTable("postCategory", {
    postId: uuid("postId").references(() => PostTable.id).notNull(),
    categoryId: uuid("categoryId").references(() => CategoryTable.id).notNull(),
}, table => {
        return {
            pk: primaryKey({ columns: [table.postId, table.categoryId]})
        }
    }
);

// RELATIONS
// While you have setup references for your tables using fks, there is no drizzle-orm
// level relationship.
export const UserTableRelations = relations(UserTable, ({ one, many }) => {
    return {
        preferences: one(UserPreferencesTable),
        posts: many(PostTable)
    }
});

export const UserPreferencesTableRelations = relations(UserPreferencesTable, ({ one }) => {
    return {
        user: one(UserTable, {
            fields: [UserPreferencesTable.userId],
            references: [UserTable.id],
        }),
    }
});

export const PostTableRelations = relations(PostTable, ({ one, many }) => {
    return{
        author: one(UserTable, {
            fields: [PostTable.authorId],
            references: [UserTable.id]
        }),
        postCategories: many(PostCategoryTable)
    }
});

export const CategoryTableRelations = relations(CategoryTable, ({ many }) => {
    return {
        postCategories: many(PostCategoryTable),
    }
});

export const PostCategoryTableRelations = relations(PostCategoryTable, ({ one }) => {
    return {
        post: one(PostTable, {
            fields: [PostCategoryTable.postId],
            references: [PostTable.id],
        }),
        category: one(CategoryTable, {
            fields: [PostCategoryTable.categoryId],
            references: [CategoryTable.id],
        }),
    }
});
