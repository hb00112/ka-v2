
    
    // --- 4. NEW Helper function for cleaning ---
    function sanitizeString(str) {
        if (typeof str !== 'string') return str;
        return str.trim().replace(/\s+/g, ' '); // Trim ends and collapse multiple spaces
    }


    // -----------------------------------------------------------------
    //  Functions for your assistant to use (NOW PROMISE-BASED)
    // -----------------------------------------------------------------

    /**
     * Reads an entire list of data from a path.
     * @param {string} dataPath - The top-level path (e.g., 'orders', 'parties').
     * @returns {Promise<object|null>} A promise that resolves with the data or null.
     */

    async function addBill(invoiceNo, amount, partialPartyName) {
        console.log(`Smart-adding bill: ${invoiceNo}, ${amount}, ${partialPartyName}`);
        
        // 1. Find the party using the existing logic
        const partyResult = await findPartyByName(partialPartyName);

        if (partyResult.found === 0) {
            // SCENARIO 4 (No Match)
            console.log("addBill: Party not found.");
            // Return an object that the AI can understand and act on
            return { 
                status: "party_not_found", 
                searchedFor: partialPartyName,
                error: `No party found starting with '${partialPartyName}'.`
            };
        }

        if (partyResult.found > 1) {
            // SCENARIO 2 (True Options)
            console.log("addBill: Multiple options found.");
            // Return the options so the AI can ask the user to choose
            return { 
                status: "needs_clarification", 
                options: partyResult.options,
                error: "Multiple parties found. AI must ask user to choose."
            };
        }

        // SCENARIO 1 & 3 (One Match / Hierarchy Match)
        // If we're here, partyResult.exactName is the *only* correct name
        const exactPartyName = partyResult.exactName;
        console.log(`addBill: Found exact party: ${exactPartyName}`);

        // 2. Now, add the bill using the *correct* party name
        const billData = {
            invoiceNo: String(invoiceNo), // Ensure it's a string
            amount: Number(amount),     // Ensure it's a number
            partyName: exactPartyName,  // We use the *found* exact name
            date: new Date().toISOString().split('T')[0],
            timestamp: Date.now()
        };
        
        // Re-use your existing addData function
        const addResult = await addData('bills', billData); 

        if (addResult.success) {
            console.log("addBill: Successfully added bill.");
            // Return a simple success message
            return {
                status: "success",
                newId: addResult.newId,
                dataAdded: billData
            };
        } else {
            console.log("addBill: Error during addData.");
            return {
                status: "error",
                error: addResult.error || "Failed to save the bill after finding the party."
            };
        }
    }

    async function readList(dataPath) {
        console.log(`Reading list from: ${dataPath}`);
        const dataRef = database.ref(dataPath);
        try {
            const snapshot = await dataRef.once('value');
            if (snapshot.exists()) {
                const data = snapshot.val();
                console.log("Assistant read this list:", data);
                return data; // Return the data
            } else {
                console.log(`No data found at path: ${dataPath}`);
                return { error: `No data found at path: ${dataPath}` };
            }
        } catch (error) {
            console.error(`Error reading ${dataPath}:`, error);
            return { error: error.message };
        }
    }

    /**
     * Searches a list for an item with a specific value.
     * @param {string} dataPath - The list to search in (e.g., 'bills').
     * @param {string} childKey - The field to search by (e.g., 'invoiceNo', 'partyName').
     * @param {string|number} childValue - The value to find (e.g., 'K0001', 'CHIRAG BAG HOUSE').
     * @returns {Promise<object|null>} A promise that resolves with the found data or null.
     */
    async function findData(dataPath, childKey, childValue) {
        console.log(`Searching ${dataPath} for ${childKey} == ${childValue}`);
        
        let processedValue = childValue;
        // If searching by partyName, ensure it's clean and uppercase
        if (childKey === 'partyName' || childKey === 'name') {
            processedValue = sanitizeString(String(childValue)).toUpperCase();
        }
        
        const dataRef = database.ref(dataPath);
        const query = dataRef.orderByChild(childKey).equalTo(processedValue);
        try {
            const snapshot = await query.once('value');
            if (snapshot.exists()) {
                const results = snapshot.val();
                console.log("Assistant found matching data:", results);
                return results; // Return the data
            } else {
                console.log(`No items found in ${dataPath} where ${childKey} is ${processedValue}`);
                return null;
            }
        } catch (error) {
            console.error("Error searching data:", error);
            return { error: error.message };
        }
    }
    
    /**
     * *** UPDATED: "Belt Treatment" Logic ***
     * Finds parties by a "starts with" search.
     * Critically, it now self-filters partial matches (e.g., "AVNI TRADERS")
     * if a more complete match exists (e.g., "AVNI TRADERS PHONDA").
     * @param {string} partialName - The partial name to search for (e.g., "avni").
     * @returns {Promise<object>} An object with results: {found: number, exactName?: string, options?: string[]}
     */
    async function findPartyByName(partialName) {
        if (!partialName) {
            return { found: 0, error: "No partialName provided" };
        }
        
        const searchName = sanitizeString(String(partialName)).toUpperCase();
        console.log(`Searching parties starting with: ${searchName}`);
        
        const dataRef = database.ref('parties');
        const query = dataRef.orderByChild('name').startAt(searchName).endAt(searchName + '\uf8ff');
        
        try {
            const snapshot = await query.once('value');
            if (snapshot.exists()) {
                const results = snapshot.val();
                const parties = Object.values(results);
                
                // Get all unique, sanitized names
                let uniqueMatches = [...new Set(parties.map(p => sanitizeString(p.name)))];
                
                // *** NEW HIERARCHY LOGIC ***
                // This filters out partial matches.
                // If we have ["AVNI TRADERS", "AVNI TRADERS PHONDA"],
                // it will remove "AVNI TRADERS" from the list.
                let bestMatches = uniqueMatches.filter(match => {
                    // Check if this 'match' is just a partial substring of *another* match
                    return !uniqueMatches.some(otherMatch => 
                        match !== otherMatch && otherMatch.startsWith(match)
                    );
                });
                // ****************************

                const numResults = bestMatches.length;

                if (numResults === 1) {
                    // Only one "best" match found
                    console.log("Found 1 hierarchical match:", bestMatches[0]);
                    return { found: 1, exactName: bestMatches[0] }; 
                } else if (numResults > 1) {
                    // Multiple "best" matches found (e.g., "DEEPAK STORES", "DEEPAK TRADERS")
                    console.log(`Found ${numResults} hierarchical matches:`, bestMatches);
                    return { found: numResults, options: bestMatches };
                } else {
                    // This case should rarely happen, but covers edge cases
                    console.log(`No non-partial matches found for: ${searchName}`);
                    return { found: 0, options: [] };
                }

            } else {
                console.log(`No parties found starting with: ${searchName}`);
                return { found: 0, options: [] };
            }
        } catch (error)
 {
            console.error("Error searching party:", error);
            return { found: 0, error: error.message };
        }
    }


    /**
     * *** UPDATED: Sanitizes party name ***
     * @param {string} partyName - The *exact* party name.
     * @param {string} startDate - Start date "YYYY-MM-DD".
     * @param {string} endDate - End date "YYYY-MM-DD".
     * @returns {Promise<Array<object>|null>} A promise that resolves with the filtered bills.
     */
    async function findBillsByPartyAndDateRange(partyName, startDate, endDate) {
        const cleanPartyName = sanitizeString(partyName).toUpperCase();
        console.log(`Searching bills for ${cleanPartyName} between ${startDate} and ${endDate}`);
        
        const dataRef = database.ref('bills');
        const query = dataRef.orderByChild('partyName').equalTo(cleanPartyName);

        try {
            const snapshot = await query.once('value');
            if (snapshot.exists()) {
                const results = snapshot.val();
                // Firebase RTDB can only filter by one key, so we filter by date in JS
                const filteredBills = Object.values(results).filter(bill => {
                    return bill.date >= startDate && bill.date <= endDate;
                });
                
                console.log(`Found ${filteredBills.length} bills in date range.`);
                return filteredBills.length > 0 ? filteredBills : null;
            } else {
                console.log(`No bills found *at all* for party: ${cleanPartyName}`);
                return null;
            }
        } catch (error) {
            console.error("Error searching bills by date:", error);
            return { error: error.message };
        }
    }


    /**
     * *** UPDATED: Sanitizes party name ***
     * @param {string} dataPath - The exact path to update (e.g., 'parties/-OVpwsTkdu-cNin2L2fu').
     * @param {object} newData - The data object to merge (e.g., {name: 'New Name'}).
     * @returns {Promise<{success: boolean, error?: string}>} A promise that resolves with success status.
     */
    async function modifyData(dataPath, newData) {
        if (!dataPath || !newData) {
            console.error("modifyData: Missing dataPath or newData");
            return { success: false, error: "Missing dataPath or newData" };
        }
        
        if (dataPath.startsWith('parties/') && newData.name) {
            newData.name = sanitizeString(newData.name).toUpperCase();
        }

        console.log(`Writing to: ${dataPath}`);
        const dataRef = database.ref(dataPath);
        try {
            await dataRef.update(newData);
            console.log("Assistant successfully updated the data!");
            return { success: true };
        } catch (error) {
            console.error("Error updating data:", error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Reads data from a single, exact path.
     * @param {string} dataPath - The exact path to the data (e.g., 'parties/-OVpwsTkdu-cNin2L2fu').
     * @returns {Promise<object|null>} A promise that resolves with the data or null.
     */
    async function readData(dataPath) {
        if (!dataPath) {
            console.error("readData: Missing dataPath");
            return { error: "Missing dataPath" };
        }
        console.log(`Reading from: ${dataPath}`);
        const dataRef = database.ref(dataPath);
        try {
            const snapshot = await dataRef.once('value');
            if (snapshot.exists()) {
                const data = snapshot.val();
                console.log("Assistant read this data:", data);
                return data; // Return the data
            } else {
                console.log(`No data found at path: ${dataPath}`);
                return null;
            }
        } catch (error) {
            console.error("Error reading data:", error);
            return { error: error.message };
        }
    }

    /**
     * *** UPDATED: Sanitizes party name ***
     * @param {string} dataPath - The list path (e.g., 'bills', 'parties').
     * @param {object} newData - The data object to add.
     * @returns {Promise<{success: boolean, newId?: string, error?: string}>}
     */
    async function addData(dataPath, newData) {
        if (!dataPath || !newData) {
            return { success: false, error: "Missing dataPath or newData" };
        }

        const currentDate = new Date().toISOString().split('T')[0]; // "YYYY-MM-DD"
        
        if (dataPath === 'parties') {
            if (newData.name) {
                newData.name = sanitizeString(newData.name).toUpperCase();
            } else {
                return { success: false, error: "New parties must have a 'name' field." };
            }
            if (!newData.createdDate) {
                newData.createdDate = currentDate;
            }
        }

        if (dataPath === 'bills') {
            if (!newData.timestamp) {
                newData.timestamp = Date.now();
            }
            if (!newData.date) {
                newData.date = currentDate;
            }
            if (!newData.partyName) {
                return { success: false, error: "New bills must have a 'partyName' field." };
            }
             newData.partyName = sanitizeString(newData.partyName).toUpperCase();
        }

        console.log(`Adding to: ${dataPath}`, newData);
        const listRef = database.ref(dataPath);
        try {
            const newRef = await listRef.push(newData);
            console.log("Assistant successfully added data with ID:", newRef.key);
            return { success: true, newId: newRef.key };
        } catch (error) {
            console.error("Error adding data:", error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Deletes data from an exact path.
     * @param {string} dataPath - The exact path to delete (e.g., 'bills/-OY0K8s17PMA_7TVKBWZ').
     * @returns {Promise<{success: boolean, error?: string}>}
     */
    async function deleteData(dataPath) {
        if (!dataPath) {
            return { success: false, error: "Missing dataPath" };
        }
        console.log(`Deleting from: ${dataPath}`);
        const dataRef = database.ref(dataPath);
        try {
            await dataRef.remove();
            console.log("Assistant successfully deleted data.");
            return { success: true };
        } catch (error) {
            console.error("Error deleting data:", error);
            return { success: false, error: error.message };
        }
    }

    /**
     * *** NEW: Smart Bill Adder ***
     * This function handles the complex logic of finding a party AND adding a bill.
     * It's what the AI will call instead of the simple 'addData'.
     */
    
   