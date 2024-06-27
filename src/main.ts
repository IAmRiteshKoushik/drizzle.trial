import { eq, gt, count } from "drizzle-orm";
import { db } from "./drizzle/db";
import { UserPreferencesTable, UserTable } from "./drizzle/schema";

async function main(){
    // -- Carry out a simple insertion
    // await db.insert(UserTable).values({
    //     name: "Kyle",
    // });
    
    // -- Carry out simple extraction
    // const user = await db.query.UserTable.findFirst();
    // console.log(user);
    
    // -- Carry out table cleaning
    // await db.delete(UserTable);

    // -- Carry out detailed insertion with returning of values
    // const user = await db
    //     .insert(UserTable)
    //     .values([
    //         {
    //             name: "Kyle",
    //             age: 23,
    //             email: "test@test.com",
    //         },
    //         {
    //             name: "Sally",
    //             age: 18,
    //             email: "test@test2.com",
    //         }
    //     ])
    //     .returning({
    //         id: UserTable.id,
    //         userName: UserTable.name,
    //     }).onConflictDoUpdate({
    //         target: UserTable.email,
    //         set: {
    //             name: "Updated Name",
    //         }
    //     });

    // -- selection from tables (2 approaches)
    // -- Approach 1 : Prisma-like syntax
    
    // await db.insert(UserPreferencesTable).values({
    //     emailUpdates: true,
    //     userId: "053cde2b-c601-415f-aefb-ac3234fa11e5",
    // });

    const users = await db.query.UserTable.findMany({
        // if false is specified, then all columns are shown with the exception
        // of the false specifications
        // columns: {
        //     email: false,
        // }

        // if true is specified then only the columns that are true are shown
        columns : {
            name: true,
            id: true,
        },
        with: {
            preferences: true,
        }

        // -- limit
        // limit: 1,

        // -- offset means skipping a certain number of rows
        // offset: 1,

        // you can run raw-SQL inside drizzle using the SQL generic
        // extras: {
        //     lowerCaseName: sql<string>`lower(${UserTable.name})`.as("lowerCaseName"),
        // },
    });
    console.log(users);
}

// so far we have seen Prisma like syntax. There is also an SQL like apporach 
// that we can take here.
const sqlmain = async() => {
    const users = await db
        .select({ 
            // id: UserTable.id, 
            // age: UserTable.age, 
            // emailUpdates: UserPreferencesTable.emailUpdates 
            name: UserTable.name,
            count: count(UserTable.name)
        }).from(UserTable)
        .where(eq(UserTable.age, 29))
        .leftJoin(UserPreferencesTable, eq(UserPreferencesTable.userId, UserTable.id))
        .having(columns => gt(columns.count, 1))
}


main();
