$ ftp -n <<EOF
open ftp.example.com
user user secret
put my-local-file.txt
EOF