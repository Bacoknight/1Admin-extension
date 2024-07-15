// Functions to detect a logged in user

// Utility function to check if an element exists in the DOM
const elementExists = (selector: string): boolean => {
    return document.querySelector(selector) !== null;
};
  
// Utility function to check cookies
const cookieExists = (name: string): boolean => {
return document.cookie.split(';').some((cookie) => cookie.trim().startsWith(`${name}=`));
};

// On every page load, check if the user is signing into any account.
// Check for login forms, common URLs, or other unique elements.
// If the user is signed in, add the application to the list of logins.
const detectGenericLogin = (): undefined => {
    if (
        // Common login form elements
        elementExists('input[type="email"]') ||
        elementExists('input[type="password"]') ||
        elementExists('input[type="submit"]') ||
        
        // Common login URLs
        window.location.href.includes('login') ||
        window.location.href.includes('signin') ||
        window.location.href.includes('auth')
    ) {
        // Assume user is signing in - obtain the application name from the URL and save to local storage
        const appName = window.location.hostname.split('.')[1];
        chrome.runtime.sendMessage({ type: 'LOGINS_DETECTED', logins: [appName] });
        return
    } else {
        // Assume user is not signing in, do nothing
        return
    }
}
  
// Function to detect Office 365 login
const detectOffice365Login = (): boolean => {
// Check for an element unique to the logged-in state or a specific cookie
return elementExists('.o365cs-nav-top') || cookieExists('Office365Session');
};
  
// Function to detect Slack login
const detectSlackLogin = (): boolean => {
// Check for an element unique to the logged-in state or a specific cookie
return elementExists('#team_menu') || cookieExists('d');
};
  
// Function to detect Miro login
const detectMiroLogin = (): boolean => {
// Check for an element unique to the logged-in state or a specific cookie
return elementExists('.miro-header') || cookieExists('_miro-session');
};
  
// Function to gather all logged-in SaaS applications
export const gatherLogins = (): string[] => {
const logins: string[] = [];
if (detectOffice365Login()) logins.push('Office 365');
if (detectSlackLogin()) logins.push('Slack');
if (detectMiroLogin()) logins.push('Miro');
return logins;
};
  
// Send the logins to the background script
chrome.runtime.sendMessage({ type: 'LOGINS_DETECTED', logins: gatherLogins() });
  