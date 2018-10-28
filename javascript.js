var environment = "rinkeby"; // ganache, rinkeby   
                            
var ganacheUrl = "HTTP://127.0.0.1:7545";
var infuraUrl = 'https://rinkeby.infura.io/v3/8da2ccf1f93e4660a6a9d1fabbf4ffd0';

var account;
var rinkebyAccount = "0x4348e2F2ac596e44E6A6D4151aE84e4aA4126A8d";            

var rinkebyContractAddress = "0x58dd71a6efe1520ee0c0ca79e63e73952cd00c23";
var ganacheContractAddress = "0xca2a40c21ffdc6e84d7a1715ad36ebdaa23664d1";
            
var defaultEstimatedGas = 3000000;

if (environment == "ganache") {
    
    // ganache
    web3 = new Web3(new Web3.providers.HttpProvider(ganacheUrl));                
} 
else if(typeof web3 != 'undefined') { 

    // case with Metamask
    environment = "Metamaks";
    web3 = new Web3(web3.currentProvider);                
}                
else if (environment == "rinkeby") {

    // infura
    web3 = new Web3(new Web3.providers.HttpProvider(infuraUrl));                
}

window.addEventListener('load', function() {

    document.querySelector("#env").innerHTML = "Using <strong>" + environment + "</strong> enviroment.";    

    if(!web3.isConnected()) { 
        
        document.querySelector("#web3Version").innerHTML = "Web3 is not connected!";                
    } else {
        var version = web3.version.api;                
        document.querySelector("#web3Version").innerHTML = "Web3 is now connected. Version: " + version;                                
    }
})

if (environment == "ganache") {
    // The default (top) wallet account from a list of test accounts 
    account = web3.eth.accounts[0];
}
else {
    account = rinkebyAccount;
}                                  

// The interface definition for your smart contract (the ABI) 
var StarNotaryContract = web3.eth.contract(abi);                        

// Grab the contract at specified deployed address with the interface defined by the ABI
var starNotary;

if (environment == "ganache") {
    starNotary = StarNotaryContract.at(ganacheContractAddress);
}
else {
    starNotary = StarNotaryContract.at(rinkebyContractAddress);
}                


/**
 * EVENTS
 */
// watch the Transfer event
var starClaimedEvent = starNotary.Transfer();                        
starClaimedEvent.watch(function(error, result) {
    if (!error) {      
        
        document.querySelector("#ajaxLoader").style.display  = "none";

        let message = "\n";

        for (var property in result) {
            if (result.hasOwnProperty(property)) {
                message += property + ":" + result[property] + "\n";
            }
        }

        log("Star was created sucessfully!: " + message);
    } else {
        log('Watching for star claimed event is failing...');
    }
});        

// watch the PutForSell event          
var starPutForSellEvent = starNotary.PutForSell();                        
starPutForSellEvent.watch(function(error, result) {
    if (!error) {      
        
        document.querySelector("#ajaxLoader").style.display  = "none";

        let message = "\n";

        for (var property in result) {
            if (result.hasOwnProperty(property)) {
                message += property + ":" + result[property] + "\n";
            }
        }

        log("Star was put for sell sucessfully!: " + message);
    } else {
        log('Watching for star put for sell event is failing...');
    }
});        

/**
 * FUNCTIONS
 */

function clearLogs() {
    document.querySelector("#log").value = "";
}

function log(message) {
    document.querySelector("#log").value += message + "\n";
}
        
function checkIfStarExist() {

    // check if the star exsits                      
    starNotary.
        checkIfStarExist(
            document.querySelector("#check-star-ra").value, 
            document.querySelector("#check-star-dec").value, 
            document.querySelector("#check-star-mag").value, 
            function(error, res) {
                log("Star exist: " + res);
            }
        );                     
}

/**
 Put a star for sale
    */
function putStarForSale() {

    let estimatedGas = defaultEstimatedGas;
    let id = document.querySelector("#sale-star-id").value;
    let value = document.querySelector("#sale-value").value;

    document.querySelector("#ajaxLoader").style.display  = "block";

    starNotary.putStarUpForSale.estimateGas( 
        id, 
        value,
        {from: account}, function(error, result) {                                            

            if (result) {
                estimatedGas = result;                            
            }                        

            starNotary.putStarUpForSale(
                id, 
                value,
                {gas: estimatedGas, from: account}, 
                function (error, result) {
                    if (!error) {
                        log("Put for sale star id " + id + ". Waiting for confirmation of transaction: " + result)
                    }
                    else {
                        log(error);
                    }
            });
    });                        
}

/**
 Lookup a star
    */ 
function lookupStar() {

    let id =  document.querySelector("#lu-star-id").value;
    starNotary.tokenIdToStarInfo(id, function(error, result) {
        if (!error) {
            log("Lookup for star id " + id + ": " + result)  
        }
        else {
            log(error);
        }
        
    });
}

/**
 Ask for a star price
    */
function askStarPrice() {

    let id = document.querySelector("#price-star-id").value;
    starNotary.starsForSale(id, function (error, result) {
        if (!error) {
            log("Price for star id " + id + ": " + result)
        }
        else {
            log(error);
        }

    });
}            

// Enable claim button being clicked
function claimButtonClicked() {                                                         

    document.querySelector("#ajaxLoader").style.display  = "block";
    let estimatedGas = defaultEstimatedGas;

    starNotary.createStar.estimateGas( 
        document.querySelector("#star-name").value, 
        document.querySelector("#star-desc").value, 
        document.querySelector("#star-ra").value, 
        document.querySelector("#star-dec").value, 
        document.querySelector("#star-mag").value, 
        document.querySelector("#star-id").value,
        {from: account}, function(error, result) {                                            

            if (result) {
                estimatedGas = result;                            
            }                        

            // create star
            starNotary.createStar(
                document.querySelector("#star-name").value, 
                document.querySelector("#star-desc").value, 
                document.querySelector("#star-ra").value, 
                document.querySelector("#star-dec").value, 
                document.querySelector("#star-mag").value, 
                document.querySelector("#star-id").value, 
                {gas: estimatedGas, from: account}, 
                function (error, result) {                                           
                    
                    if (!error) {      

                        log("Waiting for confirmation of transaction: " + result);  
                    } else { 
                        log(error);
                    }
                });                    
    });                                
}