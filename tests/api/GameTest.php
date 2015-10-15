<?php

class GameTest extends WebTestCase {
    public function setUp() {
        parent::setUp();

        $this->base_url .= '/api/games';
    }

    protected function assertOK($code, $body, $when) {
        $this->assertEquals(200, $code, "Status code must be 200 when $when.");
        $this->assertInternalType('array', $body, "Returned JSON when $when must be an array.");
    }

    protected function assertNotFound($code, $body, $when) {
        $this->assertEquals(404, $code, "Status code must be 404 when $when");
    }

    protected function assertClientError($code, $body, $when) {
        $this->assertEquals(400, $code, "Status code must be 400 when $when.");
        $this->assertInternalType('array', $body, "Returned JSON when $when must be an array.");
        $this->assertArrayHasKey('message', $body, "Error 400 must return a message with the explanation.");
    }

    protected function ensureGame($name) {
        list($code, $body) = $this->request_json('/', array('name' => $name));

        $this->assertOK($code, $body, 'creating a valid new game');
        $this->assertArrayHasKey('id', $body, 'New game must have an id.');

        return $body['id'];
    }

    protected function getGames() {
        list($code, $body) = $this->request_json('/');

        $this->assertOK($code, $body, 'retrieving the list of games');
        $this->assertNotNull($body, 'Returned list of games must not be NULL, if empty must return an empty array.');

        return $body;
    }

    protected function getGame($id) {
        list($code, $body) = $this->request_json("/$id");

        $this->assertOK($code, $body, 'retrieving a game');
        $this->assertArrayHasKey('id', $body, 'Data about the game must have the id.');
        $this->assertArrayHasKey('name', $body, 'Data about the game must have the name.');
        $this->assertArrayHasKey('black_player', $body, 'Data about the game must have the name of the black player or NULL is not yet connected.');
        $this->assertArrayHasKey('white_player', $body, 'Data about the game must have the name of the white player or NULL is not yet connected.');
        $this->assertArrayHasKey('created_at', $body, 'Data about the game must have the date when was created.');

        return $body;
    }

    /**
     * @dataProvider dataNewGameInvalidParams
     */
    public function testNewGameInvalidParams(array $params, $when) {
        list($code, $body) = $this->request_json('/', $params);

        $this->assertClientError($code, $body, $when);
        $this->assertEmpty($this->getGames(), 'List of games must be empty after trying to create an invalid game.');
    }

    public function dataNewGameInvalidParams() {
        return array(
            array([], 'creating a new game without a name parameter'),
            array(['name' => ''], 'creating a new game with an empty name'),
        );
    }

    /**
     * @dataProvider dataNewGame
     */
    public function testNewGame($name) {
        list($code, $body) = $this->request_json('/', array('name' => $name));

        $this->assertOK($code, $body, 'creating a valid new game');
        $this->assertArrayHasKey('id', $body, 'New game must have an id.');
        $this->assertCount(1, $this->getGames(), 'Quantity of games must be incremented by one.');
    }

    public function dataNewGame() {
        return array(
            array('New Game'),
            array('with/slash'),
            array('" --'),
            array('\' --'),
            array('абвгдеёжзийклмно'),
        );
    }

    public function testListGames() {
        $id = $this->ensureGame('Game');

        list($code, $body) = $this->request_json('/');

        $this->assertOK($code, $body, 'retrieving the list of games');
        $this->assertCount(1, $body, 'List of games must have the just created new game.');

        $game = array_shift($body);

        $this->assertArrayHasKey('id', $game, 'Data about the game when listing games must give the id.');
        $this->assertArrayHasKey('name', $game, 'Data about the game when listing games must give the name.');
        $this->assertArrayHasKey('created_at', $game, 'Data about the game when listing games must give the date when was created.');

        $this->assertEquals($id, $game['id'], 'Identifier for created game must match the given when created.');
        $this->assertEquals('Game', $game['name'], 'Name for created game must match the given when created.');

        $data = $this->getGame($id);
        $both = is_null($data['black_player']) || is_null($data['white_player']);

        $this->assertTrue($both, 'Retrieved games must not have black or white player data.');
    }

    /**
     * @dataProvider dataGameNotFound
     */
    public function testGameNotFound($id) {
        list($code, $body) = $this->request_json("/$id");

        $this->assertNotFound($code, $body, 'retrieving a not yet created game');
    }

    public function dataGameNotFound() {
        return array(
            array('not_found'),
            array('with\/slash'),
            array('"+--'),
        );
    }

    /**
     * @dataProvider dataConnectInvalidParams
     */
    public function testConnectInvalidParams(array $params, $when) {
        list($code, $body) = $this->request_json('/' . $this->ensureGame('Game') . '/connect', $params);

        $this->assertClientError($code, $body, $when);
    }

    public function dataConnectInvalidParams() {
        return array(
            array([], 'connecting without any parameters'),
            array(['player' => 'Kobayashi Izumi'], 'connecting without color parameter'),
            array(['color' => 'b'], 'connecting without player parameter'),
            array(['color' => 'w', 'player' => ''], 'connection with an empty player'),
            array(['color' => 'X', 'player' => 'Cho Hunhyun'], 'connection with an invalid color'),
        );
    }

    public function testConnectGameNotFound() {
        list($code, $body) = $this->request_json('/not_found/connect', [
            'player' => 'Kobayashi Satoru',
            'color'  => 'w',
        ]);

        $this->assertNotFound($code, $body, 'connecting to a game not yet created');
    }

    public function testConnect() {
        $id = $this->ensureGame('Game');

        list($code, $body) = $this->request_json("/$id/connect", [
            'player' => 'Kobayashi Koichi',
            'color'  => 'w',
        ]);

        $this->assertOK($code, $body, 'connecting');

        $game = $this->getGame($id);

        $this->assertNull($game['black_player'], 'When the first player connects, the other must be NULL.');
        $this->assertEquals('Kobayashi Koichi', $game['white_player'], 'When connecting the player name must be assigned to the given color.');
    }

    public function testConnectBoth() {
        $id = $this->ensureGame('Game');

        $players = array(
            'b' => 'Go Seigen',
            'w' => 'Fujisawa Kuranosuke',
        );

        foreach ($players as $color => $name) {
            list($code, $body) = $this->request_json("/$id/connect", [
                'player' => $name,
                'color'  => $color,
            ]);

            $this->assertOK($code, $body, 'connecting');
        }

        $game = $this->getGame($id);

        $this->assertEquals('Go Seigen', $game['black_player'], 'When connecting the player name must be assigned to the given color.');
        $this->assertEquals('Fujisawa Kuranosuke', $game['white_player'], 'When connecting the player name must be assigned to the given color.');
    }
}