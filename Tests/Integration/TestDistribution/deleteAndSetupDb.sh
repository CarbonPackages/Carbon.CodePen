TEMP_FILE_PATH='./drop_all_tables.sql'

DBNAME="db"
DBUSER="db"
DBPASS="db"

echo "SET FOREIGN_KEY_CHECKS = 0;" > $TEMP_FILE_PATH
( mysqldump --add-drop-table --no-data -u$DBUSER -p$DBPASS $DBNAME | grep 'DROP TABLE' ) >> $TEMP_FILE_PATH
echo "SET FOREIGN_KEY_CHECKS = 1;" >> $TEMP_FILE_PATH
mysql -u$DBUSER -p$DBPASS $DBNAME < $TEMP_FILE_PATH
rm -f $TEMP_FILE_PATH

./flow database:setcharset
./flow doctrine:migrate

# ./flow site:create --name testSite --package-key Carbon.TestSite --node-type Carbon.TestSite:Page
./flow site:import --package-key Carbon.TestSite
./flow user:create --roles Neos.Neos:Administrator admin admin Jon Doe
