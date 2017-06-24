<?php
class BaseClass
{
    var $basetype;
    var $lasterror;
    var $err;
    var $host;
    var $user;
    var $pass;
    var $db;
    var $connection;
    var $res;
    var $rows;
    var $fcounter;

    function BaseClass($b_type, $Cfg_host, $Cfg_user, $Cfg_password, $Cfg_db, $Cfg_host_pg = '', $Cfg_user_pg = '', $Cfg_password_pg = '', $Cfg_db_pg = '') {
        if($b_type=='mysql') {
            $this->basetype = 1;
            $this->host = $Cfg_host;
            $this->user = $Cfg_user;
            $this->pass = $Cfg_password;
            $this->db   = $Cfg_db;

        }
        else if ($b_type=='postgresql') {
            $this->basetype = 2;
            $this->host = $Cfg_host_pg;
            $this->user = $Cfg_user_pg;
            $this->pass = $Cfg_password_pg;
            $this->db   = $Cfg_db_pg;

        }
        $this->err = False;
        $this->Connect();
    }

    function Connect() {
        if ($this->basetype == 1) {
            $this->connection = @mysql_pconnect($this->host,$this->user,$this->pass);
            if ($this->connection==NULL) { 
                die("cannot connect to mysql xxx"); 
            }
            if (!$this->Database($this->db)) return false;
            return $this->connection;
        }
        else {
            $conn_string = "host=$this->host port=5432 dbname=$this->db user=$this->user password=$this->pass";
            $this->connection = pg_connect($conn_string);
            if ($this->connection==NULL) { 
                die("cannot connect to pgsql");
            }
            return $this->connection;
        }
    }


    function Database($baza) {
        if ($this->basetype == 1) {
            if (@mysql_select_db($baza)) return true;
            else return false;
        }
    }


    function Query($zap) {
        $this->err = False;
        if ($this->basetype == 1) {
            $this->res = @mysql_query($zap);
			if ($this->res == FALSE) throw new SQLException(@mysql_error(),@mysql_errno());
            return $this->res;
        }
        else {
            $this->res = @pg_Exec($this->connection,$zap);
            //               if ($this->res == FALSE) die (''.pg_errormessage($this->connection).'</br>');
            if ($this->res == FALSE) {
                $this->err = true; $this->lasterror = ''.@pg_errormessage($this->connection).' on (QUERY = "'.$zap.'")';
            }
            $this->fcounter = 0;
            return $this->res;
        }
    }


    function Rows() {
        if ($this->basetype == 1) {
            $this->rows = @mysql_num_rows($this->res);
            return $this->rows;
        }
        else {
            $this->rows = @pg_numrows($this->res);
            return $this->rows;
        }
    }

    function FetchArray() {
        if ($this->basetype == 1) {
            return @mysql_fetch_array($this->res);
        }
        else {
            $temp = @pg_Fetch_Array($this->res,$this->fcounter);
            $this->fcounter++;
            return $temp;
        }
    }

    function FetchAllArray() {
        if ($this->basetype == 1) {
            $all = array();
            while ($row = @mysql_fetch_assoc($this->res)) { 
                $all[] = $row; 
            }
            return $all;
        }
        else {
            $temp = @pg_Fetch_Array($this->res,$this->fcounter);
            $this->fcounter++;
            return $temp;
        }
    }    

    function FetchArrayRow($row) {
        if ($this->basetype == 1) {
            return @mysql_fetch_array($this->res);
        }
        else {
            return pg_Fetch_Array($this->res,$row);
        }
    }

    function FetchArrayAssoc() {
        if ($this->basetype == 1) {
            return @mysql_fetch_assoc($this->res);
        }
        else {
            return pg_Fetch_Array($this->res,$row);
        }
    }

    function DisConnect() {
        if ($this->basetype == 1) {
            @mysql_close($this->res);
        }
        else {
            @pg_Close($this->res);
        }
    }
    function insertId() {
        if ($this->basetype == 1) {
            return mysql_insert_id();
        }
        else {
            //
        }
    }
}

class SQLException extends Exception{
		
}

?>
