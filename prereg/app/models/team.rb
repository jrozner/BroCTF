class Team < ActiveRecord::Base
  attr_accessible :contact, :name, :size

  validates :contact, presence: true, uniqueness: true, format: {with: /^([^@\s]+)@((?:[-a-z0-9]+\.)+[a-z]{2,})$/i}
  validates :name, presence: true, uniqueness: true
  validates :size, presence: true, numericality: {only_integer: true, greater_than: 0, less_than: 9}
end
