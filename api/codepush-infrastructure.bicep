// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

param project_suffix string
param az_location string = 'westeurope'
param github_client_id string
@secure()
param github_client_secret string
param microsoft_client_id string
@secure()
param microsoft_client_secret string
param microsoft_tenant_id string
@secure()
param microsoft_provider_authentication_secret string
param logging bool = true

var servicePlanName = 'codepush-asp-${project_suffix}'
var storageAccountName = 'codepushstorage${project_suffix}'
var webAppName = 'codepush-${project_suffix}'
var serverUrl = 'https://codepush-${project_suffix}.azurewebsites.net'

targetScope = 'resourceGroup'

resource servicePlan 'Microsoft.Web/serverfarms@2022-03-01' = {
  name: servicePlanName
  location: az_location
  properties: {
    reserved: true
  }
  sku: {
    name: 'B1'
    tier: 'Basic'
  }
}

resource storageAccount 'Microsoft.Storage/storageAccounts@2022-09-01' = {
  name: storageAccountName
  location: az_location
  properties: {
    minimumTlsVersion: 'TLS1_2'
    allowBlobPublicAccess: true
    publicNetworkAccess: 'Enabled'
  }
  sku: {
    name: 'Standard_LRS'
  }
  kind: 'StorageV2'
}

resource webApp 'Microsoft.Web/sites@2022-03-01' = {
  name: webAppName
  location: az_location
  properties: {
    serverFarmId: servicePlan.id
    httpsOnly: true
    siteConfig: {
      minTlsVersion: '1.2'
      alwaysOn: true
      linuxFxVersion: 'NODE|18-lts'
      scmType: 'LocalGit'
      appSettings: [
        { name: 'AZURE_STORAGE_ACCOUNT', value: storageAccount.name }
        { name: 'AZURE_STORAGE_ACCESS_KEY', value: storageAccount.listKeys().keys[0].value }
        { name: 'GITHUB_CLIENT_ID', value: github_client_id }
        { name: 'GITHUB_CLIENT_SECRET', value: github_client_secret }
        { name: 'MICROSOFT_CLIENT_ID', value: microsoft_client_id }
        { name: 'MICROSOFT_CLIENT_SECRET', value: microsoft_client_secret }
        { name: 'MICROSOFT_TENANT_ID', value: microsoft_tenant_id }
        { name: 'MICROSOFT_PROVIDER_AUTHENTICATION_SECRET', value: microsoft_provider_authentication_secret }
        { name: 'WEBSITE_NODE_DEFAULT_VERSION', value: '18-lts' }
        { name: 'SERVER_URL', value: serverUrl }
        { name: 'CORS_ORIGIN', value: serverUrl }
        { name: 'LOGGING', value: logging ? 'true' : 'false' }
      ]
    }
  }
}

resource authSettings 'Microsoft.Web/sites/config@2022-03-01' = {
  parent: webApp
  name: 'authsettingsV2'
  properties: {
    globalValidation: {
      unauthenticatedClientAction: 'AllowAnonymous'
      redirectToProvider: 'azureActiveDirectory'
      excludedPaths: ['/authenticated','/v0.1/public/*']
    }
    httpSettings: {
      requireHttps: true
      routes: {
        apiPrefix: '/.auth'
      }
    }
    identityProviders: {
      azureActiveDirectory: {
        enabled: true
        registration: {
          openIdIssuer: 'https://sts.windows.net/${subscription().tenantId}/v2.0'
          clientId: microsoft_client_id
          clientSecretSettingName: 'MICROSOFT_CLIENT_SECRET'
        }
        validation: {
          allowedAudiences: [microsoft_client_id]
          defaultAuthorizationPolicy: {
            allowedPrincipals: {}
          }
        }
        login: {
          disableWWWAuthenticate: false
        }
      }
    }
    login: {
      preserveUrlFragmentsForLogins: true
      tokenStore: {
        enabled: true
      }
    }
  }
}

resource scmBasicAuth 'Microsoft.Web/sites/basicPublishingCredentialsPolicies@2022-03-01' = {
  name: 'scm'
  parent: webApp
  properties: {
    allow: true
  }
}
