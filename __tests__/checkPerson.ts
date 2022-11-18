import { JsonField, JSONParse } from "../src";

test("The Person results need to be equal after conversion.", () => {
  const person = new Person();
  person.name = "你好";
  person.id = "1";
  person.age = 12;
  person.city = new City("112", "Shanghai");
  person.pets = [new Pet([new Dog("Dog1")], [new Cat("cat1"), new Cat("cat2")])];

  const data = JSON.stringify(person);
  const parseResult = JSONParse(data, Person);
  expect(parseResult).toEqual(person);
});

export class City {
  id: string;
  @JsonField({ names: ["city_name", "cityName"] })
  name: string;

  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
  }

  toJson() {
    return {
      id: this.id,
      city_name: this.name,
    };
  }
}

export class Dog {
  @JsonField("dog_name")
  name: string;

  constructor(name: string) {
    this.name = name;
  }

  toJson() {
    return {
      dog_name: this.name,
    };
  }
}

export class Cat {
  @JsonField("cat_name")
  name: string;

  constructor(name: string) {
    this.name = name;
  }

  toJson() {
    return {
      cat_name: this.name,
    };
  }
}

export class Pet {
  @JsonField({ names: ["pets_dogs"], from: Dog })
  dogs: Dog[];
  @JsonField({ names: ["pets_cats"], from: Cat })
  cats: Cat[];

  constructor(dogs: Dog[], cats: Cat[]) {
    this.dogs = dogs;
    this.cats = cats;
  }

  toJson() {
    return {
      pets_dogs: this.dogs,
      pets_cats: this.dogs,
    };
  }
}

export class Person {
  id: string;
  @JsonField("person_name")
  name: string;
  @JsonField({ names: ["person_age", "old_person_age"] })
  age: number;
  @JsonField({ names: ["city"], from: City })
  city: City;

  @JsonField({
    from: Pet,
  })
  pets: Pet[];

  toJson() {
    return {
      id: this.id,
      person_name: this.name,
      person_age: this.age,
      city: this.city,
    };
  }
}
