./flow database:setcharset
./flow doctrine:migrate
./flow site:create --name testSite --package-key Carbon.TestSite --node-type Carbon.TestSite:Page
./flow user:create --roles Neos.Neos:Administrator admin admin Jon Doe
