class Restaurant extends React.Component {

    render() {
        const restaurant = window.data.restaurant;
        const menu = restaurant.active_menu;

        return (
            <div className="container">
                <NavBar/>
                <h1>Welcome to {restaurant.name}</h1>
                <h2>{menu.menu_name}</h2>
                <MenuWrapper
                    sections={menu.menu.sections}
                    item_order={menu.menu.item_order}
                    items={menu.menu.items}
                />     
            </div>
        );
  }
}

class NavBar extends React.Component {

    render() {
        return (
            <div className="header clearfix">
                <nav>
                    <ul className="nav nav-pills pull-right">
                        <li role="presentation"><a href="#">Home</a></li>
                        <li role="presentation"><a href="#">About</a></li>
                        <li role="presentation"><a href="#">Contact</a></li>
                    </ul>
                </nav>
                <h3 className="text-muted">Picme</h3>
            </div>
        );
    }
}

class MenuWrapper extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            displayTheme: 'list',
            sections: ["Favoriler"].concat(this.props.sections),
            item_order: [{section: "Favoriler", items: []}].concat(this.props.item_order),
            items: this.props.items,
            fav_original_locations: []
        }
        this.handleSearchQueryChange = this.handleSearchQueryChange.bind(this);
        this.handleButtonPressedChange = this.handleButtonPressedChange.bind(this);
        this.handleToggleFavorite = this.handleToggleFavorite.bind(this);
        this.addItemToFavorites = this.addItemToFavorites.bind(this);
        this.removeItemFromFavorites = this.removeItemFromFavorites.bind(this);
    }

    handleSearchQueryChange(query) {
        let items = this.props.items;
        let items_displayed = items.filter(item => item.item.name.toUpperCase().includes(query.toUpperCase()));
        this.setState({
            items: items_displayed
        });
    }   

    handleButtonPressedChange(theme) {
        this.setState({displayTheme: theme});
    }

    handleToggleFavorite(button) {
        let item_id = button.id;
        if (button.value == "non-favorite") {
            this.addItemToFavorites(item_id);
        }
        else {
            this.removeItemFromFavorites(item_id); 
        }   
    }

    addItemToFavorites(item_id) {
        let new_order = [...this.state.item_order];
        let original_locations = [...this.state.fav_original_locations];

        let original_section_index = -1;
        let original_section_offset = -1;
        for (let i = 0; i < new_order.length; i++) {
            original_section_offset = new_order[i].items.indexOf(item_id);
            if (original_section_offset > -1) {
                new_order[i].items.splice(original_section_offset, 1);
                console.log(new_order[i].items);
                original_section_index = i;
                break;
            }
        }
        new_order[0].items.push(item_id);
        original_locations.push({id:item_id, index: original_section_index, offset: original_section_offset});
        this.setState({
            item_order: new_order,
            fav_original_locations: original_locations
        });
    }

    removeItemFromFavorites(item_id) {
        let new_order = [...this.state.item_order];
        let original_positions = [...this.state.fav_original_locations];
        let original_position = original_positions.filter(item => item.id == item_id);
        let index = original_position[0].index;
        let offset = original_position[0].offset;

        new_order[0].items.splice(new_order[0].items.indexOf(item_id), 1);
        new_order[index].items.splice(offset, 0, item_id);

        original_positions = original_positions.filter(item => item.id != item_id);

        this.setState({
            item_order: new_order,
            fav_original_locations: original_positions 
        });
    }

    render() {
        return (
            <div>
                <SearchBar
                    onSearchQueryChange={this.handleSearchQueryChange}
                />
                <DisplayStyleButtons
                    onButtonPressedChange={this.handleButtonPressedChange}
                />
                <Menu   
                    sections={this.state.sections}
                    item_order={this.state.item_order}
                    items={this.state.items}
                    displayTheme={this.state.displayTheme}
                    favorites={this.state.item_order[0].items}
                    toggleFavorite={this.handleToggleFavorite}
                />
            </div>
        );
    }

}

class DisplayStyleButtons extends React.Component {
    
    constructor(props) {
        super(props);
        this.handleButtonPress = this.handleButtonPress.bind(this);
    }

    handleButtonPress(e) {
        this.props.onButtonPressedChange(e.target.value);
    }

    render() {
        return (
            <div className="btn-group" role="group">
                <button 
                    type="button"
                    value="list" 
                    className="btn btn-secondary"
                    onClick={this.handleButtonPress}
                    >List
                </button>
                <button 
                    type="button"
                    value="grid" 
                    className="btn btn-secondary"
                    onClick={this.handleButtonPress}
                    >Grid
                </button>
            </div>
        );
    }
}

class Menu extends React.Component {

    constructor(props) {
        super(props);
        this.mapItemsBySection = this.mapItemsBySection.bind(this);
    }

    mapItemsBySection(sections, item_order, items) {
        let section_items = {}

        sections.forEach((section) => {
            let item_ids = []
            item_order.forEach((order) => {
                if (section == order.section) {
                    item_ids = order.items;
                }
            });
            let match_items = []
            item_ids.forEach((id) => {
                items.forEach((item) => {
                    if (id == item.id) {
                        match_items.push(item); 
                    }
                });
            });
            section_items[section] = match_items;
        });

        return section_items;
    }

    render() {
        let sections = this.props.sections;
        const item_order = this.props.item_order;
        const items = this.props.items;
        const displayTheme = this.props.displayTheme;
        const section_items = this.mapItemsBySection(sections, item_order, items);

        sections = sections.filter(section => section_items[section].length > 0);
        const elements = sections.map((section) => 
            <MenuSection
                key={"section" + section}
                name={section}
                items={section_items[section]}
                favorites={this.props.favorites}
                displayTheme={this.props.displayTheme}
                toggleFavorite={this.props.toggleFavorite}
            />
        );
        return (
            <React.Fragment>
                {elements}
            </React.Fragment>
        );
    }
}

class SearchBar extends React.Component {

    constructor(props) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(e) {
        this.props.onSearchQueryChange(e.target.value);
    }

    render() {
        return (
            <div className="form-group">
                <label htmlFor="search-query">Arama Yap</label>
                <form className="form-inline mr-auto">
                    <input
                        id="search-query"
                        onChange={this.handleChange} 
                        className="form-control" 
                        type="text" 
                        placeholder="Yemek Adına Göre" 
                        aria-label="Yemek Adına Göre">
                    </input>
                </form>
            </div>
        );
    }
}

class MenuSection extends React.Component {

    render() {

        const name = <h3 key="name">{this.props.name}</h3>
        const items = this.props.items;
        const theme = this.props.displayTheme;

        let elements = [];
        if (theme == "list") {
            elements = items.map((item) => 
                <MenuItem 
                    key={item.id}
                    item_id={item.id}
                    name={item.item.name}
                    ingredients={item.item.ingredients}
                    images={item.item.images}
                    price={item.item.price}
                    favorited={this.props.favorites.indexOf(item.id) > -1}
                    toggleFavorite={this.props.toggleFavorite}
                    displayTheme={this.props.displayTheme}
                />
            );
            return (
                <React.Fragment>
                    {name}
                    <div className="row">
                        {elements}
                    </div>
                </React.Fragment>
            );
        }
        else {
            let num_rows = Math.floor(items.length / 2) + items.length % 2;
            let last_row_items = items.length % 2;
            
            let loop_until = (last_row_items == 0) ? num_rows : num_rows - 1;
            for (let i = 0; i < loop_until; i++) {
                let first_item = items[i * 2]
                let second_item = items[i * 2 + 1]
                elements.push(
                    <div className="row" key={first_item.id + second_item.id}>
                        <div className="col-md-6">
                            <MenuItem 
                                item_id={first_item.id}
                                name={first_item.item.name}
                                ingredients={first_item.item.ingredients}
                                images={first_item.item.images}
                                price={first_item.item.price}
                                favorited={this.props.favorites.indexOf(first_item.id) > -1}
                                toggleFavorite={this.props.toggleFavorite}
                                displayTheme={this.props.displayTheme}
                            />
                        </div>
                        <div className="col-md-6">
                            <MenuItem 
                                item_id={second_item.id}
                                name={second_item.item.name}
                                ingredients={second_item.item.ingredients}
                                images={second_item.item.images}
                                price={second_item.item.price}
                                favorited={this.props.favorites.indexOf(second_item.id) > -1}
                                toggleFavorite={this.props.toggleFavorite}
                                displayTheme={this.props.displayTheme}
                            />
                        </div>
                    </div>
                );
                
            }
            
            if (loop_until == num_rows - 1) {
                let last_item = items[items.length-1];
                elements.push(
                    <div className="row" key={last_item.id}>
                        <div className="col-md-6">
                            <MenuItem
                                key={last_item.id}
                                item_id={last_item.id}
                                name={last_item.item.name}
                                ingredients={last_item.item.ingredients}
                                images={last_item.item.images}
                                price={last_item.item.price}
                                favorited={this.props.favorites.indexOf(last_item.id) > -1}
                                toggleFavorite={this.props.toggleFavorite}
                                displayTheme={this.props.displayTheme}
                            />
                        </div>
                    </div>
                );
            }
            return (
                <React.Fragment>
                    {name}
                    {elements}
                </React.Fragment>
            );

        }
    }
}

class MenuItem extends React.Component {
    render() {

        let fav_button_text = this.props.favorited ? "Favorilerde" : "Favorilere Ekle";
        let fav_button_value = this.props.favorited ? "favorite" : "non-favorite";

        let imageUrl;
        if (this.props.images.length > 0)
            imageUrl = this.props.images[0]['100']
        
        if (imageUrl) {
            return ( 
                <div className="well">
                    <div className="media">
                        <MenuItemImage
                            url={imageUrl}
                        />
                    <div className="media-body">
                        <MenuItemInfo 
                            item_id={this.props.item_id}
                            name={this.props.name}
                            ingredients={this.props.ingredients}
                            price={this.props.price}
                            favorited={this.props.favorited}
                            toggleFavorite={this.props.toggleFavorite}
                            favButtonText={fav_button_text}
                            favButtonValue={fav_button_value}
                        />
                    </div>
                    </div>
                </div>
            );
        }
        else {
            return ( 
                <div className="well">
                    <MenuItemInfo
                        item_id={this.props.item_id}
                        name={this.props.name}
                        ingredients={this.props.ingredients}
                        price={this.props.price}
                        favorited={this.props.favorited}
                        toggleFavorite={this.props.toggleFavorite}
                        favButtonText={fav_button_text}
                        favButtonValue={fav_button_value}
                    />
                </div>
            );
        }
    }
}

class MenuItemInfo extends React.Component {

    constructor(props) {
        super(props);
        this.toggleFavorite = this.toggleFavorite.bind(this);
    }

    toggleFavorite(e) {
        this.props.toggleFavorite(e.target);
    }

    render() {
        return (
            <div>
                <h4 className="media-heading">
                    {this.props.name}
                    <span style={{float:"right"}}>
                        {this.props.price + " TL"}
                    </span>
                </h4>
                <p>
                    {this.props.ingredients.join(", ")}
                </p>
                <button 
                    id={this.props.item_id}
                    type="button"
                    value={this.props.favButtonValue}
                    className="btn btn-default"
                    onClick={this.toggleFavorite}
                >
                    <img src="./images/heart.png"></img>
                    {this.props.favButtonText}
                </button>
            </div>
        );
    }
}

class MenuItemImage extends React.Component {
    render() {
        return (
            <div className="media-left">
                <a href="#">
                <img 
                    className="media-object img-rounded"
                    src={this.props.url}
                    alt="item_image"
                />
                </a>
            </div>
        );
    }
}

$(function() {

    ReactDOM.render(
        <Restaurant/>,
        document.getElementById('react-root')
    );

})
