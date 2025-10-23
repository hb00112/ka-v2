// --- ADD THESE TWO LINES AT THE VERY TOP OF THE FILE ---
const CUSTOM_SEARCH_API_KEY = "AIzaSyCdtvVgAMpxLBt12nvXNmdWgCeIxBpgmec";
const SEARCH_ENGINE_ID = "612fedd9ff2a84b3e";
// ----------------------------------------------------

// --- 4. NEW Helper function for cleaning ---
function sanitizeString(str) {
    if (typeof str !== 'string') return str;
    return str.trim().replace(/\s+/g, ' '); // Trim ends and collapse multiple spaces
}


// -----------------------------------------------------------------
//  Functions for your assistant to use (NOW PROMISE-BASED)
// -----------------------------------------------------------------

/**
 * *** NEW: Smart Bill Adder ***
 * This function handles the complex logic of finding a party AND adding a bill.
 */
async function addBill(invoiceNo, amount, partialPartyName) {
    console.log(`Smart-adding bill: ${invoiceNo}, ${amount}, ${partialPartyName}`);
    
    // 1. Find the party using the existing logic
    const partyResult = await findPartyByName(partialPartyName);

    if (partyResult.found === 0) {
        // SCENARIO 4 (No Match)
        console.log("addBill: Party not found.");
        return { 
            status: "party_not_found", 
            searchedFor: partialPartyName,
            error: `No party found starting with '${partialPartyName}'.`
        };
    }

    if (partyResult.found > 1) {
        // SCENARIO 2 (True Options)
        console.log("addBill: Multiple options found.");
        return { 
            status: "needs_clarification", 
            options: partyResult.options,
            error: "Multiple parties found. AI must ask user to choose."
        };
    }

    // SCENARIO 1 & 3 (One Match / Hierarchy Match)
    const exactPartyName = partyResult.exactName;
    console.log(`addBill: Found exact party: ${exactPartyName}`);

    // 2. Now, add the bill using the *correct* party name
    const billData = {
        invoiceNo: String(invoiceNo),
        amount: Number(amount),
        partyName: exactPartyName,
        date: new Date().toISOString().split('T')[0],
        timestamp: Date.now()
    };
    
    const addResult = await addData('bills', billData); 

    if (addResult.success) {
        console.log("addBill: Successfully added bill.");
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

/**
 * Reads an entire list of data from a path.
 */
async function readList(dataPath) {
    console.log(`Reading list from: ${dataPath}`);
    const dataRef = database.ref(dataPath);
    try {
        const snapshot = await dataRef.once('value');
        if (snapshot.exists()) {
            const data = snapshot.val();
            console.log("Assistant read this list:", data);
            return data;
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
 */
async function findData(dataPath, childKey, childValue) {
    console.log(`Searching ${dataPath} for ${childKey} == ${childValue}`);
    
    let processedValue = childValue;
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
            return results;
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
 * Finds parties by a "starts with" search.
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
            
            let uniqueMatches = [...new Set(parties.map(p => sanitizeString(p.name)))];
            
            let bestMatches = uniqueMatches.filter(match => {
                return !uniqueMatches.some(otherMatch => 
                    match !== otherMatch && otherMatch.startsWith(match)
                );
            });

            const numResults = bestMatches.length;

            if (numResults === 1) {
                console.log("Found 1 hierarchical match:", bestMatches[0]);
                return { found: 1, exactName: bestMatches[0] }; 
            } else if (numResults > 1) {
                console.log(`Found ${numResults} hierarchical matches:`, bestMatches);
                return { found: numResults, options: bestMatches };
            } else {
                console.log(`No non-partial matches found for: ${searchName}`);
                return { found: 0, options: [] };
            }

        } else {
            console.log(`No parties found starting with: ${searchName}`);
            return { found: 0, options: [] };
        }
    } catch (error) { // <-- THIS IS THE CORRECTED SYNTAX
        console.error("Error searching party:", error);
        return { found: 0, error: error.message };
    }
}


/**
 * Finds all bills for a *specific party* that fall within a given *date range*.
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
 * Update data at a specific, *existing* path in the database.
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
            return data;
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
 * Add a new item to a list (like 'bills' or 'parties').
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
 * *** NEW: Google Search Tool ***
 * Searches the web for general knowledge questions.
 */
async function googleSearch(query) {
    console.log(`Searching Google for: ${query}`);
    
    // THIS IS THE CORRECTED LOGIC
    if (!CUSTOM_SEARCH_API_KEY || !SEARCH_ENGINE_ID || CUSTOM_SEARCH_API_KEY === "PASTE_YOUR_NEW_API_KEY_HERE") {
        return { error: "Google Search API is not configured. The developer must add an API key and Search Engine ID." };
    }

    // THIS IS THE CORRECTED URL, USING THE CONST VARIABLES
    const url = `https://www.googleapis.com/customsearch/v1?key=${CUSTOM_SEARCH_API_KEY}&cx=${SEARCH_ENGINE_ID}&q=${encodeURIComponent(query)}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            const errData = await response.json();
            return { error: `Google Search API error: ${errData.error.message}` };
        }
        const data = await response.json();

        if (data.items && data.items.length > 0) {
            // Return the first 3 results
            const results = data.items.slice(0, 3).map(item => ({
                title: item.title,
                snippet: item.snippet,
                source: item.link
            }));
            return { 
                status: "success",
                results: results,
                summary: `Found ${data.items.length} results. Top result: ${results[0].snippet}`
            };
        } else {
            return { status: "no_results", summary: "No relevant results found on Google." };
        }
    } catch (error) {
        console.error("Error in googleSearch:", error);
        return { error: error.message };
    }
}
