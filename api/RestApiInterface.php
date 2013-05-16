<?php
abstract class RestApiInterface
{
	protected $db;
	
	protected function __construct()
	{
		global $db;
		$this->db = $db;
	}
	
	abstract public function all();
	abstract public function one( $id );
	abstract public function post( $data );
	abstract public function put( $id, $data );
	abstract public function delete( $id );
    abstract public function validate( $data );
	
	protected function _objectToArray($obj) 
	{
        $arrObj = is_object($obj) ? get_object_vars($obj) : $obj;
        foreach ($arrObj as $key => $val) {
            $val = (is_array($val) || is_object($val)) ? $this->_objectToArray($val) : $val;
            $arr[$key] = $val;
        }
        return $arr;
	}  	
}

?>